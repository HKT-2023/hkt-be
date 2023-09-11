import { Model } from "mongoose";
import { Bid, BidDocument } from "src/models/schemas/bid.schema";

export class BidRepository {
  constructor(private readonly model: Model<BidDocument>) {}

  public async save(bid: Bid): Promise<Bid> {
    const newBid = new this.model(bid);
    return this.model.create(newBid);
  }

  public async getListBid(
    NFTId: string,
    sellingConfigId: string,
    page: number,
    limit: number
  ): Promise<Bid[]> {
    return this.model
      .find({
        nftId: NFTId,
        sellingConfigId,
      })
      .sort({ price: "desc" })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  public async totalBidByNFT(
    NFTId: string,
    sellingConfigId: string
  ): Promise<number> {
    return this.model.count({
      nftId: NFTId,
      sellingConfigId,
    });
  }

  public async getWinningBid(
    NFTId: string,
    sellingConfigId: string
  ): Promise<Bid> {
    return this.model
      .findOne({
        nftId: NFTId,
        sellingConfigId,
      })
      .sort({ price: "desc" });
  }

  public async getUserCurrentBid(
    nftSellingConfigId: string,
    userId: string
  ): Promise<Bid> {
    return this.model.findOne({
      userId,
      sellingConfigId: nftSellingConfigId,
    });
  }
}
