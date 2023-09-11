import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type AgentListingDocument = HydratedDocument<AgentListing>;

export enum AgentListingSoldStatus {
  Processing = "processing",
  Sold = "sold",
}

export enum AgentListingMintNFTStatus {
  NotMint = "not_mint",
  NFTMinted = "NFT_minted",
}

export enum RewardListingStatus {
  NotCalculate = "not_calculate",
  Calculated = "calculated",
}

export interface IAgent {
  portion: number;
  agentId: string;
  email?: string;
}

export enum CommissionType {
  Percentage = "%",
  Value = "value",
}

@Schema()
export class AgentListing extends CreateUpdateSchema {
  @Prop()
  agents: IAgent[];

  @Prop()
  buyerId: string;

  @Prop()
  buyerReferralId: string;

  @Prop()
  sellerId: string;

  @Prop()
  sellerReferralId: string;

  @Prop({ unique: true })
  listingId: string;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: AgentListingSoldStatus.Processing })
  soldStatus: AgentListingSoldStatus;

  @Prop({ default: AgentListingMintNFTStatus.NotMint })
  mintNFTStatus: AgentListingMintNFTStatus;

  @Prop({ default: RewardListingStatus.NotCalculate })
  rewardStatus: RewardListingStatus;

  @Prop()
  soldPrice: number;

  @Prop({ default: 0 })
  commission: number;

  @Prop()
  onMarketDate: Date;

  @Prop()
  listingContractDate: Date;

  @Prop()
  closeDate: Date;

  @Prop()
  commissionType: CommissionType;

  @Prop()
  buyerAgencyCompensation: string;

  @Prop()
  buyerAgencyCompensationType: string;
}

export const AgentListingSchema = SchemaFactory.createForClass(AgentListing);
