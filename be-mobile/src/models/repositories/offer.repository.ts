import { Model } from "mongoose";
import {
  Offer,
  OfferDocument,
  OfferStatus,
} from "src/models/schemas/offer.schema";

export class OfferRepository {
  constructor(private readonly model: Model<OfferDocument>) {}

  public async save(offer: Offer): Promise<Offer> {
    const newOffer = new this.model(offer);
    return this.model.create(newOffer);
  }

  public async getOfferById(offerId: string): Promise<Offer> {
    return this.model.findOne({ _id: offerId });
  }

  public async getListOffer(
    NFTId: string,
    sellingConfigId: string,
    page: number,
    limit: number
  ): Promise<Offer[]> {
    return this.model
      .find({
        nftId: NFTId,
        sellingConfigId,
        status: OfferStatus.Created,
      })
      .sort({ price: "desc" })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  public async totalOfferByNFT(
    NFTId: string,
    sellingConfigId: string
  ): Promise<number> {
    return this.model.count({
      nftId: NFTId,
      sellingConfigId,
    });
  }

  public async getMyLatestOffer(
    userId: string,
    sellingConfigId: string
  ): Promise<Offer> {
    return this.model
      .findOne({
        userId,
        sellingConfigId,
      })
      .sort({
        createdAt: "desc",
      });
  }

  public async getAllOfferBySellingConfig(
    sellingConfigId: string
  ): Promise<Offer[]> {
    return this.model.find({
      sellingConfigId,
      status: OfferStatus.Created,
    });
  }
}
