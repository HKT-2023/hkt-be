import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type OfferDocument = HydratedDocument<Offer>;

@Schema()
export class Offer extends CreateUpdateSchema {
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
  status: OfferStatus;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

export enum OfferStatus {
  Created = "created",
  Canceled = "canceled",
  Approved = "approved",
  Rejected = "rejected",
}
