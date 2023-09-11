export enum NftMessageSuccess {
  SellingFixedSuccess = "NFT selling configuration at fixed price set successfully.",
  BidSuccess = "NFT bidding configuration set successfully.",
  ConfigOfferSuccess = "NFT offer configuration set successfully.",
  MakeOfferSuccess = "Offer made successfully.",
  CancelSellingConfigSuccess = "Selling configuration cancelled successfully.",
  CancelOfferSuccess = "Offer cancelled successfully.",
  ApproveOfferSuccess = "Offer approved successfully.",
  RejectOfferSuccess = "Offer rejected successfully.",
  BuyNFTSuccess = "NFT purchased successfully.",
  GetNFTMarketPlaceSuccess = "NFTs in exchange retrieved successfully.",
  MakeBidNFTSuccess = "NFT bid made successfully.",
  ListOfferSuccess = "Offer list retrieved successfully.",
  ListBidSuccess = "Bid list retrieved successfully.",
  GetSaleHistorySuccess = "Sales history retrieved successfully.",
  EndAuctionSuccess = "Auction ended successfully.",
  EstimateFeeSuccess = "Fee estimate successful.",
}

export enum NftMessageError {
  NftNotFound = "NFT not found.",
  NotOwnerNFT = "Not the owner of the NFT.",
  OfferNotFound = "Offer not found.",
  NotOwnerOffer = "Not the owner of the offer.",
  NftSellingConfigExist = "NFT listed on exchange.",
  NoSellingConfigFound = "No selling config found.",
  SellingConfigNotActive = "Selling config not active.",
  ConfigNotTypeOfOffer = "Selling config not of offer type.",
  NotOwnerSellingConfig = "Not the owner of the selling config.",
  SameOwnerNFT = "Current owner of the NFT.",
  OfferCancelled = "Offer has been cancelled.",
  StartPriceHigherThanWinning = "Your starting price cannot be lower than your winning price.",
  PriceMustHigherThanCurrentBid = "Price must be higher than the current bid.",
}

export enum NFTQueue {
  UpdatExpiredOffer = "update_expired_offer",
}

export const ESTIMATE_GAS_FEE_KEY = "estimateGasFee";
