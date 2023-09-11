import { Model } from "mongoose";
import {
  Estimation,
  EstimationDocument,
  EstimationStatus,
} from "src/models/schemas/estimations";

export class EstimationsRepository {
  constructor(private readonly model: Model<EstimationDocument>) {}

  public async save(estimation: Estimation): Promise<Estimation> {
    const newEstimation = new this.model(estimation);
    return this.model.create(newEstimation);
  }

  public async getUserEstimationByListingId(
    userId: string,
    listingId: string
  ): Promise<Estimation> {
    return this.model.findOne({
      userId,
      listingId,
    });
  }

  public async getEstimationsByListingId(
    listingId: string,
    page: number,
    limit: number,
    sortBy = {}
  ): Promise<Estimation[]> {
    return this.model
      .find({
        listingId,
      })
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);
  }

  public async getAllEstimationsByListingId(
    listingId: string
  ): Promise<Estimation[]> {
    return this.model.find({
      listingId,
      price: {
        $ne: null,
      },
    });
  }

  public async getTotalEstimationByListingId(
    listingId: string
  ): Promise<number> {
    return this.model.count({ listingId });
  }

  public async getEstimationsNoAccuracy(
    listingId: string
  ): Promise<Estimation[]> {
    return this.model.find({
      listingId,
      accuracy: null,
    });
  }

  public async getAllEstimationCalculated(): Promise<Estimation[]> {
    return this.model.find({
      status: EstimationStatus.AccuracyCalculated,
    });
  }

  public async getEstimationByIds(
    estimationIds: string[]
  ): Promise<Estimation[]> {
    return this.model.find({
      _id: { $in: estimationIds },
    });
  }
}
