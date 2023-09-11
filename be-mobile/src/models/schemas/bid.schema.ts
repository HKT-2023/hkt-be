import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type BidDocument = HydratedDocument<Bid>;

@Schema()
export class Bid extends CreateUpdateSchema {
  @Prop()
  sellingConfigId: string;

  @Prop()
  userId: string;

  @Prop()
  nftId: string;

  @Prop()
  price: number;

  @Prop()
  currency: string;

  @Prop()
  description: string;

  @Prop()
  status: BidStatus;
}

export const BidSchema = SchemaFactory.createForClass(Bid);

export enum BidStatus {
  Created = "created",
  Canceled = "canceled",
  Winning = "winning",
  Done = "done",
}
