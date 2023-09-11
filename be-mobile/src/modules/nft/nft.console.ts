import { Command, Console } from "nestjs-console";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Nft, NftDocument } from "src/models/schemas/nft.schema";
import { NftSellingConfigsRepository } from "src/models/repositories/nft-selling-configs.repository";
import {
  NftSellingConfig,
  NftSellingConfigDocument,
  NftSellingConfigStatus,
  NftSellingConfigType,
} from "src/models/schemas/nft-selling-configs.schema";
import { NFTQueue } from "src/modules/nft/nft.const";
import { BidRepository } from "src/models/repositories/bid.repository";
import { Bid, BidDocument } from "src/models/schemas/bid.schema";
import { WalletRepository } from "src/models/repositories/wallet.repository";
import { Wallet, WalletDocument } from "src/models/schemas/wallet.schema";
import { HederaLib } from "src/libs/hedera.lib";
import { WalletService } from "src/modules/wallet/wallet.service";
import { NftRepository } from "src/models/repositories/nft.repository";
import { TransactionRepository } from "src/models/repositories/transaction.repository";
import {
  Transaction,
  TransactionDocument,
} from "src/models/schemas/transaction.schema";
import { User, UserDocument } from "src/models/schemas/user.schema";
import { UserRepository } from "src/models/repositories/user.repository";
import { NftService } from "src/modules/nft/nft.service";
import { UserPointRepository } from "src/models/repositories/user-point.repository";
import {
  UserPoint,
  UserPointDocument,
} from "src/models/schemas/user-point.schema";
import { TypeOfUser } from "src/modules/user/user.const";
const Queue = require("bull");

@Console()
export class NftConsole {
  private readonly userPointRepository: UserPointRepository;
  private readonly nftSellingConfigsRepository: NftSellingConfigsRepository;
  private readonly walletRepository: WalletRepository;
  private readonly bidRepository: BidRepository;
  private readonly nftRepository: NftRepository;
  private readonly userRepository: UserRepository;
  private readonly transactionRepository: TransactionRepository;
  private readonly updateOfferExpiredQueue = new Queue(
    NFTQueue.UpdatExpiredOffer,
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
    @InjectModel(UserPoint.name)
    private readonly userPointModel: Model<UserPointDocument>,
    @InjectModel(Nft.name)
    private readonly nftModel: Model<NftDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Bid.name)
    private readonly bidModel: Model<BidDocument>,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(NftSellingConfig.name)
    private readonly nftSellingConfigModel: Model<NftSellingConfigDocument>
  ) {
    this.userPointRepository = new UserPointRepository(this.userPointModel);
    this.nftSellingConfigsRepository = new NftSellingConfigsRepository(
      this.nftSellingConfigModel
    );
    this.bidRepository = new BidRepository(this.bidModel);
    this.walletRepository = new WalletRepository(this.walletModel);
    this.nftRepository = new NftRepository(this.nftModel);
    this.transactionRepository = new TransactionRepository(
      this.transactionModel
    );
    this.userRepository = new UserRepository(this.userModel);
  }

  @Command({ command: "provider-finish-auction" })
  async providerFinishAuction(): Promise<void> {
    let page = 1;
    const limit = 20;

    while (1) {
      const finishAuctions =
        await this.nftSellingConfigsRepository.getSellingConfigExpired(
          NftSellingConfigType.Bid,
          page,
          limit
        );

      if (finishAuctions.length === 0) {
        break;
      }

      for (const auction of finishAuctions) {
        auction.status = NftSellingConfigStatus.Processing;
        auction.updatedAt = new Date();
        await this.nftSellingConfigsRepository.save(auction);
        await this.updateOfferExpiredQueue.add(auction);
      }
      page++;
    }

    console.log(`${NftConsole.name}: Finish auction`);
  }

  @Command({ command: "consumer-finish-auction" })
  public async consumerFinishAuction(): Promise<void> {
    await this.updateOfferExpiredQueue.process(async (job, done) => {
      console.log(
        `${NftConsole.name}: Got an message for finish auction`,
        job.data
      );

      const sellingConfig =
        await this.nftSellingConfigsRepository.getSellingConfigById(
          job.data._id
        );

      const winingBid = await this.bidRepository.getWinningBid(
        sellingConfig.nftId,
        sellingConfig._id
      );
      const NFT = await this.nftRepository.getNFTById(job.data.nftId);
      const sellerWallet = await this.walletRepository.getWalletByUserId(
        sellingConfig.userId
      );
      await this.hederaLib.setOperator(
        sellerWallet.accountId,
        WalletService.decodeWalletPrivateKey(sellerWallet.privateKey)
      );

      if (!winingBid) {
        const transactions = await this.hederaLib.cancelNFTAuction(
          process.env.NFT_TOKEN_ID,
          NFT.tokenId
        );
        await this.transactionRepository.save(transactions.senderTransaction);
        sellingConfig.status = NftSellingConfigStatus.InActive;
        sellingConfig.updatedAt = new Date();
        NFT.saleStatus = NftSellingConfigStatus.InActive;
        NFT.updatedAt = new Date();
        await this.nftRepository.save(NFT);
        await this.nftSellingConfigsRepository.save(sellingConfig);
        done(new Error(`${NftConsole.name}: No bid found for NFT`));
        return;
      }

      const buyerWallet = await this.walletRepository.getWalletByUserId(
        winingBid.userId
      );
      const buyer = await this.userRepository.getUserById(winingBid.userId);
      const transactions = await this.hederaLib.completeAuction(
        process.env.NFT_TOKEN_ID,
        NFT.tokenId,
        winingBid.price,
        NFT.point,
        buyerWallet.accountId
      );

      await this.transactionRepository.save(transactions.senderTransaction);
      if (!transactions.status) {
        sellingConfig.status = NftSellingConfigStatus.Failed;
        sellingConfig.updatedAt = new Date();
        await this.nftSellingConfigsRepository.save(sellingConfig);
        done(new Error(`${NftConsole.name}: Finish auction failed`));
        return;
      }

      await this.hederaLib.updateUserPoint(
        buyerWallet.userId,
        NFT.point,
        this.userPointRepository,
        NFT.nftType
      );

      await this.hederaLib.updateUserPoint(
        sellingConfig.userId,
        -NFT.point,
        this.userPointRepository,
        NFT.nftType
      );

      sellingConfig.status = NftSellingConfigStatus.InActive;
      sellingConfig.updatedAt = new Date();

      NFT.ownerName = NftService.getOwnerNFTName(buyer);
      NFT.ownerAddress = buyerWallet.address;
      NFT.ownerAccountId = buyerWallet.accountId;
      NFT.saleStatus = NftSellingConfigStatus.InActive;
      NFT.userId = buyer._id;
      NFT.updatedAt = new Date();

      await this.transactionRepository.save(transactions.receiverTransaction);
      await this.nftRepository.save(NFT);
      await this.nftSellingConfigsRepository.save(sellingConfig);
      done();
    });
  }
}
