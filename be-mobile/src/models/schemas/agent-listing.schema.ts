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
  ProcessingMint = "processing_mint",
  NFTMinted = "NFT_minted",
  NFTMintFailed = "NFT_mint_failed",
}

export enum RewardListingStatus {
  NotCalculate = "not_calculate",
  Calculating = "calculating",
  Calculated = "calculated",
  FailedCalculateAccuracy = "failed_calculate",
  SendingReward = "sending_reward",
  RewardSent = "reward_sent",
}

export enum WorkingWith {
  Seller = "seller",
  Buyer = "buyer",
}

export interface IAgent {
  portion: number;
  workingWith: WorkingWith[];
  agentId: string;
  email?: string;
}

@Schema()
export class AgentListing extends CreateUpdateSchema {
  @Prop()
  agents: IAgent[];

  @Prop()
  buyerId: string;

  @Prop()
  sellerId: string;

  @Prop()
  referralId: string;

  @Prop({ unique: true })
  listingId: string;

  @Prop({ default: 1 })
  viewCount: number;

  @Prop({ default: AgentListingSoldStatus.Processing })
  soldStatus: AgentListingSoldStatus;

  @Prop({ default: AgentListingMintNFTStatus.NotMint })
  mintNFTStatus: AgentListingMintNFTStatus;

  @Prop({ default: RewardListingStatus.NotCalculate })
  rewardStatus: RewardListingStatus;

  @Prop()
  soldPrice: number;

  @Prop()
  failedReason: string;

  @Prop()
  commission: string;

  @Prop()
  commissionType: string;

  @Prop()
  sellerReferralId: string;

  @Prop()
  buyerReferralId: string;

  @Prop()
  sellerCommission: number;

  @Prop()
  sellerReferralShare: number;

  @Prop()
  buyerCommission: number;

  @Prop()
  buyerReferralShare: number;
}

export const AgentListingSchema = SchemaFactory.createForClass(AgentListing);
