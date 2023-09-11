import { Model } from "mongoose";
import {
  DistributeReward,
  DistributeRewardType,
} from "src/models/schemas/distribute-reward.schema";

export class DistributeRewardRepository {
  constructor(private readonly model: Model<DistributeReward>) {}

  async save(distributeReward: DistributeReward): Promise<DistributeReward> {
    const newDistributeReward = new this.model(distributeReward);
    return this.model.create(newDistributeReward);
  }

  public async getDistributeReward(
    distributeRewardTypes: DistributeRewardType[]
  ): Promise<DistributeReward[]> {
    return this.model.find({
      distributeRewardType: {
        $in: distributeRewardTypes,
      },
    });
  }
}
