import { Command, Console } from "nestjs-console";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HederaLib } from "src/libs/hedera.lib";
import { TransactionRepository } from "src/models/repositories/transaction.repository";
import {
  Transaction,
  TransactionDocument,
  TransactionType,
} from "src/models/schemas/transaction.schema";
import { ActivityQueue } from "src/modules/activity/activity.const";
import { sleep } from "src/shares/utils";
const Queue = require("bull");

@Console()
export class ActivityConsole {
  private readonly transactionRepository: TransactionRepository;
  private readonly updateTransactionFeeQueue = new Queue(
    ActivityQueue.TransactionFeeUpdate,
    {
      redis: {
        port: Number(process.env.REDIS_PORT),
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
      },
    }
  );

  constructor(
    private readonly hederaLib: HederaLib,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>
  ) {
    this.transactionRepository = new TransactionRepository(
      this.transactionModel
    );
  }

  @Command({ command: "provider-un-estimate-transaction-fee" })
  async providerFinishAuction(): Promise<void> {
    let page = 1;
    const limit = 20;

    while (1) {
      console.log(`Running at ${new Date()}`);
      const unEstimateTransactions =
        await this.transactionRepository.getUnEstimateTransactionFee(
          page,
          limit
        );
      console.log(
        `Select with page ${page}, limit ${limit}. Found ${unEstimateTransactions.length}`
      );

      if (unEstimateTransactions.length === 0) {
        page = 1;
        await sleep(15000);
        continue;
      }

      const defaultEstimateGasFee = process.env.HEDERA_FAULT_GAS_FEE
        ? process.env.HEDERA_FAULT_GAS_FEE
        : "1.072";

      for (const transaction of unEstimateTransactions) {
        transaction.gasFee = defaultEstimateGasFee;
        transaction.updatedAt = new Date();
        await this.transactionRepository.save(transaction);
        await this.updateTransactionFeeQueue.add(transaction);
      }
      page++;
    }
  }

  @Command({ command: "consumer-un-estimate-transaction-fee" })
  public async consumerFinishAuction(): Promise<void> {
    await this.updateTransactionFeeQueue.process(async (job, done) => {
      console.log(
        `${ActivityConsole.name}: Got an message for estimate transaction fee`,
        job.data
      );

      const data: Transaction = job.data;
      const transaction = await this.transactionRepository.getDetailById(
        data._id
      );

      if (
        transaction.transactionType ===
          TransactionType.ReceiveTokenFromAuctionNoFee ||
        transaction.transactionType ===
          TransactionType.ReceiveNFTFromAuctionNoFee ||
        transaction.transactionType === TransactionType.CancelSaleWithOfferNoFee
      ) {
        if (
          transaction.transactionType ===
          TransactionType.CancelSaleWithOfferNoFee
        )
          transaction.transactionType = TransactionType.CancelSaleWithOffer;

        if (
          transaction.transactionType ===
          TransactionType.ReceiveTokenFromAuctionNoFee
        )
          transaction.transactionType = TransactionType.ReceiveTokenFromAuction;

        if (
          transaction.transactionType ===
          TransactionType.ReceiveNFTFromAuctionNoFee
        )
          transaction.transactionType = TransactionType.ReceiveNFTFromAuction;

        transaction.gasFee = "0";
        transaction.updatedAt = new Date();
        await this.transactionRepository.save(transaction);
        done();
        return;
      }

      if (
        !transaction.status ||
        transaction.transactionType === TransactionType.ReceiveTokenByLossBid ||
        transaction.transactionType ===
          TransactionType.ReceiveTokenFromSaleAtFixedPrice ||
        transaction.transactionType === TransactionType.ReceiveNFTFromOffer ||
        transaction.transactionType === TransactionType.ReceiveNFTFromAuction ||
        transaction.transactionType === TransactionType.ReceiveToken ||
        transaction.transactionType === TransactionType.ReceiveNFT ||
        transaction.transactionType ===
          TransactionType.ReceiveTokenFromLearning ||
        transaction.transactionType ===
          TransactionType.ReceiveTokenFromEstimation
      ) {
        transaction.gasFee = "0";
      } else {
        const realGasFee = await this.hederaLib.getTransactionFee(
          transaction.transactionId
        );
        if (!realGasFee) {
          done();
          return;
        }
        transaction.gasFee = realGasFee;
      }

      transaction.updatedAt = new Date();
      await this.transactionRepository.save(transaction);
      done();
    });
  }
}
