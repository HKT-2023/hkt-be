import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type TransactionDocument = HydratedDocument<Transaction>;

export enum TransactionType {
  // Sale at fixed price
  PurchasedNFT = "PurchasedNFT",
  SaleAtFixedPrice = "SaleAtFixedPrice",
  ReceiveTokenFromSaleAtFixedPrice = "ReceiveTokenFromSaleAtFixedPrice",
  CancelSaleAtFixedPrice = "CancelSaleAtFixedPrice",

  // Sale with offer
  SaleNFTWithOffer = "SaleNFTWithOffer",
  SendOffer = "SendOffer",
  ApproveOffer = "ApproveOffer",
  ReceiveNFTFromOffer = "ReceiveNFTFromOffer",
  CancelSaleWithOffer = "CancelSaleWithOffer",
  CancelSaleWithOfferNoFee = "CancelSaleWithOfferNoFee",

  // Auction
  SaleNFTWithAuction = "SaleNFTWithAuction",
  SendAuction = "SendAuction",
  EarlyFinishAuction = "EarlyFinishAuction",
  ReceiveTokenFromAuction = "ReceiveTokenFromAuction",
  ReceiveNFTFromAuction = "ReceiveNFTFromAuction",
  CancelSaleAuction = "CancelSaleAuction",
  ReceiveTokenByLossBid = "ReceiveTokenByLossBid",

  ReceiveToken = "ReceiveToken",
  TransferNFT = "TransferNFT",
  TransferToken = "TransferToken",
  ReceiveNFT = "ReceiveNFT",

  ApproveNFT = "ApproveNFT",
  ApproveToken = "ApproveToken",

  ReceiveTokenFromLearning = "ReceiveTokenFromLearning",
  SendTokenForLearner = "SendTokenForLearner",
  SendTokenForEstimation = "SendTokenForEstimation",
  ReceiveTokenFromEstimation = "ReceiveTokenFromEstimation",

  ReceiveTokenFromAuctionNoFee = "ReceiveTokenFromAuctionNoFee",
  ReceiveNFTFromAuctionNoFee = "ReceiveNFTFromAuctionNoFee",
}

export enum TransactionTypeMapping {
  // Sale at fixed price
  PurchasedNFT = "Buyer buy the NFT",
  SaleAtFixedPrice = "Listed NFT for fixed price",
  ReceiveTokenFromSaleAtFixedPrice = "Seller receive token form the transaction (Royalty 5%)",
  CancelSaleAtFixedPrice = "Seller cancel the selling in the marketplace",

  // Sale with offer
  SaleNFTWithOffer = "Seller push NFT with offer option to marketplace",
  SendOffer = "Buyer send the offer to seller",
  ApproveOffer = "Seller approve the offer (Royalty 5%)",
  ReceiveNFTFromOffer = "Buyer receives NFT from the offer",
  CancelSaleWithOffer = "Seller cancel the selling with offer",

  // Auction
  SaleNFTWithAuction = "Listed NFT for auction",
  SendAuction = "Submit Bid",
  EarlyFinishAuction = "Seller end the auction before the ending time",
  ReceiveTokenFromAuction = "Seller receive token once the auction is finish (Charge royalty and gas for the seller)",
  ReceiveNFTFromAuction = "Receive NFT from Auction",
  CancelSaleAuction = "Seller cancel",

  ReceiveToken = "Receive",
  TransferNFT = "Send NFT",
  TransferToken = "Send",
  ReceiveNFT = "Receive NFT Transfer", // Receive NFT

  ApproveNFT = "Approved",
  ApproveToken = "Contract Interaction",

  ReceiveTokenFromLearning = "Learn to Earn",
  SendTokenForLearner = "Send token for learner",

  SendTokenForEstimation = "Send token for estimation",
  ReceiveTokenFromEstimation = "Receive token from estimation",

  ReceiveTokenByLossBid = "Someone put higher price than your in auction. Buyer receive back token",
}

@Schema({ collection: "transactions" })
export class Transaction extends CreateUpdateSchema {
  @Prop()
  accountId: string;

  @Prop()
  tokenId: number;

  @Prop()
  transactionId: string;

  @Prop()
  transactionType: TransactionType;

  @Prop()
  referralRawId: string;

  @Prop()
  content: string;

  @Prop()
  status: boolean;

  @Prop()
  message: string;

  @Prop()
  memo: string;

  @Prop()
  gasFee: string;

  @Prop()
  royalty: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
