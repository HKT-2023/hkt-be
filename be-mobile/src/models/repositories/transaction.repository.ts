import { Model } from "mongoose";
import {
  Transaction,
  TransactionType,
} from "src/models/schemas/transaction.schema";
import { GetActivitiesDto } from "src/modules/activity/dto";

export class TransactionRepository {
  constructor(private readonly model: Model<Transaction>) {}

  public async save(transaction: Transaction): Promise<Transaction> {
    const newTransaction = new this.model(transaction);
    return this.model.create(newTransaction);
  }

  public async getActivitiesByUserId(
    accountId: string,
    conditions: GetActivitiesDto
  ): Promise<Transaction[]> {
    return conditions.types
      ? this.model
          .find({
            accountId,
            transactionType: {
              $in: conditions.types,
            },
          })
          .skip((conditions.page - 1) * conditions.limit)
          .limit(conditions.limit)
          .sort({
            createdAt: -1,
          })
      : this.model
          .find({
            accountId,
          })
          .skip((conditions.page - 1) * conditions.limit)
          .limit(conditions.limit)
          .sort({
            createdAt: -1,
          });
  }

  public async getDetailById(id: string): Promise<Transaction> {
    return this.model.findOne({ _id: id });
  }

  public async getSaleHistoryByTokenId(
    tokenId: number,
    page: number,
    limit: number
  ): Promise<Transaction[]> {
    return this.model
      .find({
        tokenId,
        transactionType: {
          $in: [
            TransactionType.ReceiveNFT,
            TransactionType.ReceiveNFTFromAuction,
            TransactionType.ReceiveNFTFromOffer,
            TransactionType.PurchasedNFT,
          ],
        },
        status: true,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: "desc" });
  }

  public async getTotalSaleHistoryByTokenId(tokenId: number): Promise<number> {
    return this.model.count({
      tokenId,
    });
  }

  public async getUnEstimateTransactionFee(
    page: number,
    limit: number
  ): Promise<Transaction[]> {
    return this.model
      .find({
        gasFee: null,
      })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  public async getLatestTransactionWithFee(): Promise<Transaction> {
    return this.model
      .findOne({
        gasFee: { $gt: 0 },
      })
      .sort({ createdAt: "desc" });
  }
}
