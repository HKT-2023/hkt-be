import { Model } from "mongoose";
import {
  UserAccuracyEstimations,
  UserAccuracyEstimationsDocument,
} from "src/models/schemas/user-accuracy-estimations.schema";

export class UserAccuracyEstimationsRepository {
  constructor(private readonly model: Model<UserAccuracyEstimationsDocument>) {}

  public async save(
    userAccuracyEstimations: UserAccuracyEstimations
  ): Promise<UserAccuracyEstimations> {
    const newUserAccuracyEstimations = new this.model(userAccuracyEstimations);
    return this.model.create(newUserAccuracyEstimations);
  }

  public async getUserAccuracyByUserId(
    userId: string
  ): Promise<UserAccuracyEstimations> {
    return this.model.findOne({
      userId,
    });
  }
}
