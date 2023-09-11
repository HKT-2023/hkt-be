import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";
import {
  NftSellingConfigStatus,
  NftSellingConfigType,
} from "src/models/schemas/nft-selling-configs.schema";

export type NftDocument = HydratedDocument<Nft>;

export enum NFTType {
  Buyer = "buyer",
  Seller = "seller",
  Agent = "agent",
  Referral = "referral",
  Client = "client",
}

@Schema()
export class Nft extends CreateUpdateSchema {
  @Prop()
  userId: string;

  @Prop()
  images: string;

  @Prop()
  name: string;

  @Prop()
  propertyAddress: string;

  @Prop()
  salesPrice: number;

  @Prop()
  salesDate: Date;

  @Prop()
  theListDate: string;

  @Prop()
  endDate: string;

  @Prop({ type: Object })
  salesType: { key: string; title: string };

  @Prop()
  price: number;

  @Prop()
  point: number;

  @Prop()
  winningPrice: number;

  @Prop()
  agentName: string;

  @Prop()
  customer: string;

  @Prop()
  tokenId: number;

  @Prop()
  contractAddress: string;

  @Prop()
  ownerAccountId: string;

  @Prop()
  ownerAddress: string;

  @Prop()
  transactionId: string;

  @Prop()
  nftType: NFTType;

  @Prop()
  listingId: string;

  @Prop()
  ownerName: string;

  @Prop()
  putSaleType: NftSellingConfigType;

  @Prop()
  putSaleTime: Date;

  @Prop()
  saleStatus: NftSellingConfigStatus;

  @Prop()
  sellingConfigId: string;
}

export const NftSchema = SchemaFactory.createForClass(Nft);
