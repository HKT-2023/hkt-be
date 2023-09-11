export enum WalletMessageSuccess {
  GetWalletSuccess = "Wallet retrieved successfully.",
  SendTokenSuccess = "Token sent successfully.",
  SendNFTSuccess = "NFT sent successfully.",
}

export enum WalletMessageError {
  ReceiveWalletNotFound = "Receiving wallet not found.",
  NotOwnerNFT = "Not the owner of the NFT.",
  SameWallet = "Error: Unable to send to the same wallet address",
  CurrentNFTSelling = "Unable to send NFT because it is currently for sale.",
  InvalidAmount = "Invalid amount entered.",
  MinimumSendToken = "The minimum transfer amount is 5 REAL. Please try again.",
}
