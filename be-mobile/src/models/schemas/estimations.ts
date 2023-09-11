import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type EstimationDocument = HydratedDocument<Estimation>;

export enum EstimationStatus {
  Created = "created",
  AccuracyCalculated = "accuracy_calculated",
  RewardSent = "reward_sent",
  RewardSending = "reward_sending",
  FailedToSendRewardEstimation = "reward_sent_failed",
}

@Schema({ collection: "estimations" })
export class Estimation extends CreateUpdateSchema {
  @Prop()
  userId: string;

  @Prop()
  listingId: string;

  @Prop()
  price: number;

  @Prop()
  ratings: IRating[];

  @Prop()
  ratingAvg: number;  

  @Prop()
  feedback: string;

  @Prop()
  accuracy: number;

  @Prop({
    default(): EstimationStatus {
      return EstimationStatus.Created;
    },
  })
  status: EstimationStatus;
}

export class IRating {
  key?: string;
  title: string
  rate: number;
}

export const EstimationSchema = SchemaFactory.createForClass(Estimation);
