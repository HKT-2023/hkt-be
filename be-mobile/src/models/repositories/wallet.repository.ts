import { Model } from "mongoose";
import { Wallet, WalletDocument } from "src/models/schemas/wallet.schema";

export class WalletRepository {
  constructor(private readonly model: Model<WalletDocument>) {}

  public async save(wallet: Wallet): Promise<Wallet> {
    const newWallet = new this.model(wallet);
    return this.model.create(newWallet);
  }

  public async getWalletByUserId(userId: string, filter = []): Promise<Wallet> {
    return this.model
      .findOne({
        userId,
      })
      .select(filter);
  }

  public async getWalletsByListUserId(
    listUserIds: string[]
  ): Promise<Wallet[]> {
    return this.model.find({
      userId: { $in: listUserIds },
    });
  }

  public async getWalletByAccountId(accountId: string): Promise<Wallet> {
    return this.model.findOne({
      accountId,
    });
  }
}
