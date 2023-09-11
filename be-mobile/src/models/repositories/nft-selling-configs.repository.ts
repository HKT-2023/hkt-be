import { Model } from "mongoose";
import {
  NftSellingConfig,
  NftSellingConfigDocument,
  NftSellingConfigStatus,
  NftSellingConfigType,
} from "src/models/schemas/nft-selling-configs.schema";

export class NftSellingConfigsRepository {
  constructor(private readonly model: Model<NftSellingConfigDocument>) {}

  public async save(
    nftSellingConfig: NftSellingConfig
  ): Promise<NftSellingConfig> {
    const newNftSellingConfig = new this.model(nftSellingConfig);
    return this.model.create(newNftSellingConfig);
  }

  public async getActiveConfigActiveByNftId(
    nftId: string
  ): Promise<NftSellingConfig> {
    return this.model.findOne({
      nftId: nftId,
      status: NftSellingConfigStatus.Active,
    });
  }

  public async getListConfigActiveByNftIds(
    nftIds: string[]
  ): Promise<NftSellingConfig[]> {
    return this.model.find({
      nftId: { $in: nftIds },
      status: NftSellingConfigStatus.Active,
    });
  }

  public async getSellingConfigById(id: string): Promise<NftSellingConfig> {
    return this.model.findOne({
      _id: id,
    });
  }

  public async getSellingConfig(
    page: number,
    limit: number
  ): Promise<NftSellingConfig[]> {
    return this.model
      .find({ status: NftSellingConfigStatus.Active })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  public async getSellingConfigExpired(
    type: NftSellingConfigType,
    page: number,
    limit: number
  ): Promise<NftSellingConfig[]> {
    return this.model
      .find({
        type,
        status: NftSellingConfigStatus.Active,
        endTime: { $lte: new Date().toISOString() },
      })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  public async countTotal(): Promise<number> {
    return this.model.count({
      status: NftSellingConfigStatus.Active,
    });
  }
}
