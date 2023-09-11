import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type NftSellingConfigDocument = HydratedDocument<NftSellingConfig>;

@Schema({ collection: "nft_selling_configs" })
export class NftSellingConfig extends CreateUpdateSchema {
  @Prop()
  userId: string;

  @Prop()
  nftId: string;

  @Prop()
  type: NftSellingConfigType;

  @Prop()
  price: number;

  @Prop()
  currency: string;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: string;

  @Prop()
  status: NftSellingConfigStatus;

  @Prop()
  winningPrice: number;

  @Prop()
  minPrice: number;
}

export const NftSellingConfigSchema =
  SchemaFactory.createForClass(NftSellingConfig);

export enum NftSellingConfigStatus {
  Active = "active",
  InActive = "inActive",
  Failed = "failed",
  Processing = "processing",
}

export enum NftSellingConfigType {
  SellFixedPrice = "sellFixedPrice",
  Bid = "bid",
  Offer = "offer",
}

export enum MappingSellingConfigType {
  sellFixedPrice = "Fixed price",
  bid = "Auction",
  offer = "Offer",
}
