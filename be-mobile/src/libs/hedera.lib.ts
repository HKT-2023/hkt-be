import {
  AccountAllowanceApproveTransaction,
  AccountCreateTransaction,
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  PrivateKey,
  TokenAssociateTransaction,
  TokenId,
  TransactionRecordQuery,
} from "@hashgraph/sdk";
import { Wallet } from "src/models/schemas/wallet.schema";
import { hethers } from "@hashgraph/hethers";
import {
  Transaction,
  TransactionType,
} from "src/models/schemas/transaction.schema";
import { NftService } from "src/modules/nft/nft.service";
const CryptoJS = require("crypto-js");
import BigNumber from "bignumber.js";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UserPointRepository } from "src/models/repositories/user-point.repository";
import { PointType, UserPoint } from "src/models/schemas/user-point.schema";
import { NFTType } from "src/models/schemas/nft.schema";

export enum ListFunctionSCSupported {
  Mint = "mint",
  TransferNFT = "transferFrom",
  Approve = "approve",
}

export const royaltyPercent = 0.05;

export enum ListFunctionKLAYTNSCSupported {
  Transfer = "transferFrom",
}

export enum ListFunctionNFTMarketPlaceSC {
  PutNFTOnSale = "putNftOnMarketplace",
  PutNFTOffSale = "putNftOffMarketplace",
  BuyNFT = "buy",
  MakeOffer = "makeOffer",
  AcceptOfferNFT = "acceptOfferNFT",
  CancelOffer = "cancelOffer",
}

export enum ListFunctionAuctionSC {
  CreateAuction = "createAuction",
  CancelAuction = "cancelAuction",
  PlaceBid = "placeBid",
  CompleteAuction = "completeBid",
}

export const DEFAULT_GAS = 1000000;
export const TOKEN_DECIMAL = 2;

export interface IResponseCallBLC {
  transactionId: string;
  status: boolean;
  message: string;
  serial: null;
}

export const NOT_ENOUGH_HBAR_BALANCE_STATUS = 10;
export interface ITransactionExecuted {
  senderTransaction: Transaction;
  receiverTransaction: Transaction;
  status: boolean;
  message: string;
}

export class HederaLib {
  private readonly client: any;

  constructor() {
    this.client = Client.forTestnet();
    this.client.setOperator(
      process.env.HEDERA_ADMIN_ACCOUNT_ID,
      process.env.HEDERA_ADMIN_PRIVATE_KEY
    );
  }

  private async execFunctionOnSC(
    contractId: string,
    scSupportFunction: string,
    params: ContractFunctionParameters,
    isMintNFT = false
  ): Promise<IResponseCallBLC> {
    let serial = null;
    try {
      const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(DEFAULT_GAS)
        // .setPayableAmount(50)
        .setFunction(scSupportFunction, params);

      const maxRetries = 5;
      let retries = 0;
      let contractExecuteSubmit = null;

      while (retries < maxRetries) {
        try {
          contractExecuteSubmit = await contractExecuteTx.execute(this.client);
          break; // If execution succeeds, exit the loop
        } catch (error) {
          console.error(`Error executing contract transaction: ${error}`);
          retries++;

          if (retries < maxRetries) {
            const retryDelay = 1000; // Delay in milliseconds before retrying
            console.log(`Retrying in ${retryDelay / 1000} seconds...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          } else {
            console.error("Max retries reached. Exiting...");
            throw error; // Throw the error to be handled at a higher level
          }
        }
      }

      console.log('contractExecuteSubmit', contractExecuteSubmit);

      // Process the response or handle the error
      if (contractExecuteSubmit) {
        // Process the response
        await contractExecuteSubmit.getReceipt(this.client);
        if (isMintNFT) {
          const result = await contractExecuteSubmit.getRecord(this.client);
          serial = result.contractFunctionResult.getInt64(1).toNumber();
        }
        return {
          transactionId: contractExecuteSubmit?.transactionId?.toString(),
          status: true,
          message: "Success",
          serial: serial,
        };
      }
    } catch (error) {
      return {
        transactionId: error?.transactionId?.toString(),
        status: false,
        message:
          error.status._code === NOT_ENOUGH_HBAR_BALANCE_STATUS
            ? "Not enough HBAR balance to execute transaction"
            : error.message,
        serial: serial,
      };
    }
  }

  private static createTransaction(
    transactionId: string,
    transactionType: TransactionType,
    content: string,
    accountId: string,
    status: boolean,
    message: string,
    tokenId = null
  ): Transaction {
    const newTransaction = new Transaction();
    newTransaction.transactionId = transactionId;
    newTransaction.transactionType = transactionType;
    newTransaction.content = content;
    newTransaction.accountId = accountId;
    newTransaction.status = status;
    newTransaction.message = message;
    newTransaction.tokenId = tokenId;
    return newTransaction;
  }

  public async setOperator(
    accountId: string,
    privateKey: string
  ): Promise<void> {
    this.client.setOperator(accountId, privateKey);
  }

  public async sendNFT(
    fromAddress: string,
    toAddress: string,
    tokenId: number,
    point: number,
    name: string,
    receiverAccountId: string
  ): Promise<ITransactionExecuted> {
    const blockchainResponse = await this.execFunctionOnSC(
      process.env.NFT_SMART_CONTRACT,
      ListFunctionSCSupported.TransferNFT,
      new ContractFunctionParameters()
        .addAddress(fromAddress)
        .addAddress(toAddress)
        .addInt64(new BigNumber(tokenId))
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.TransferNFT,
      JSON.stringify({ price: 0, point: -point, name, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    if (!blockchainResponse.status)
      return {
        senderTransaction: senderTransaction,
        receiverTransaction: null,
        message: blockchainResponse.message,
        status: blockchainResponse.status,
      };

    const receiverTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ReceiveNFT,
      JSON.stringify({ price: 0, point: point, royalty: 0 }),
      receiverAccountId,
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async sendToken(
    sender: string,
    receiver: string,
    amount: number,
    receiverAccountId: string
  ): Promise<ITransactionExecuted> {
    const blockchainResponse = await this.execFunctionOnSC(
      process.env.TOKEN_SMART_CONTRACT,
      ListFunctionKLAYTNSCSupported.Transfer,
      new ContractFunctionParameters()
        .addAddress(sender)
        .addAddress(receiver)
        .addInt64(
          new BigNumber(Math.floor(amount)).times(new BigNumber(10).pow(TOKEN_DECIMAL))
        )
    );
    console.log("blockchainResponse", blockchainResponse);

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.TransferToken,
      JSON.stringify({ price: -amount, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message
    );

    if (!blockchainResponse.status)
      return {
        senderTransaction,
        receiverTransaction: null,
        message: blockchainResponse.message,
        status: blockchainResponse.status,
      };

    const receiverTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ReceiveToken,
      JSON.stringify({ price: amount, point: 0, royalty: 0 }),
      receiverAccountId,
      blockchainResponse.status,
      blockchainResponse.message
    );

    return {
      senderTransaction,
      receiverTransaction,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async mintNFT(
    receiveWalletAddress: string,
    tokenId: number,
    point: number,
    receiverAccountId: string
  ): Promise<ITransactionExecuted> {
    const blockchainResponse = await this.execFunctionOnSC(
      process.env.NFT_SMART_CONTRACT,
      ListFunctionSCSupported.Mint,
      new ContractFunctionParameters()
        .addAddress(receiveWalletAddress)
        .addBytesArray([new TextEncoder().encode("KLAYTN NFT")]),
      true
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.TransferNFT,
      JSON.stringify({ price: 0, point: -point, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      blockchainResponse.serial
    );

    if (!blockchainResponse.status)
      return {
        senderTransaction,
        receiverTransaction: null,
        message: blockchainResponse.message,
        status: blockchainResponse.status,
      };

    const receiverTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ReceiveNFT,
      JSON.stringify({ price: 0, point: point, royalty: 0 }),
      receiverAccountId,
      blockchainResponse.status,
      blockchainResponse.message,
      blockchainResponse.serial
    );

    return {
      senderTransaction,
      receiverTransaction,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async createNewAccount(userId: string): Promise<Wallet> {
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;
    const transaction = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .execute(this.client);

    const getReceipt = await transaction.getReceipt(this.client);
    const newAccountId = getReceipt.accountId;

    await this.associateKLAYTNTokenToWallet(
      newAccountId.toString(),
      newAccountPrivateKey.toString()
    );

    const newWallet = new Wallet();
    newWallet.userId = userId;
    newWallet.createdTxHash = transaction.transactionHash.toString();
    newWallet.createdTxId = transaction.transactionId.toString();
    newWallet.accountId = newAccountId.toString();
    newWallet.address = hethers.utils.getAddressFromAccount(
      newAccountId.toString()
    );
    newWallet.nodeId = transaction.nodeId.toString();
    newWallet.privateKey = CryptoJS.AES.encrypt(
      newAccountPrivateKey.toString(),
      process.env.HEDERA_SECRET_KEY_ENCRYPT
    ).toString();
    newWallet.publicKey = newAccountPublicKey.toString();
    return newWallet;
  }

  public async associateKLAYTNTokenToWallet(
    accountId: string,
    accountPrivateKey: string
  ): Promise<void> {
    const transaction = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([process.env.TOKEN_ID, process.env.NFT_TOKEN_ID])
      .freezeWith(this.client);
    const signTx = await transaction.sign(
      PrivateKey.fromString(accountPrivateKey)
    );
    const txResponse = await signTx.execute(this.client);
    await txResponse.getReceipt(this.client);
  }

  public async approveNFT(
    tokenId: number,
    accountId: string,
    privateKey: string,
    smartContractId = null
  ): Promise<Transaction> {
    try {
      const smartContractAllowance = smartContractId
        ? smartContractId
        : process.env.NFT_SMART_CONTRACT;
      const transaction = new AccountAllowanceApproveTransaction()
        .approveTokenNftAllowanceAllSerials(
          TokenId.fromString(process.env.NFT_TOKEN_ID),
          accountId,
          smartContractAllowance
        )
        .freezeWith(this.client);
      const signTx = await transaction.sign(PrivateKey.fromString(privateKey));
      const txResponse = await signTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const newTransaction = new Transaction();
      newTransaction.transactionType = TransactionType.ApproveNFT;
      newTransaction.accountId = accountId;
      newTransaction.tokenId = tokenId;
      newTransaction.transactionId = signTx.transactionId.toString();
      newTransaction.content = JSON.stringify({ price: 0, royalty: 0 });
      newTransaction.status = Boolean(receipt.status);
      return newTransaction;
    } catch (error) {
      throw new HttpException(
        { message: "Not enough of token balance" },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  public async approveToken(
    price: number,
    accountId: string,
    privateKey: string,
    spenderAccountId: string
  ): Promise<Transaction> {
    try {
      const maxRetries = 5;
      let retries = 0;
      let signTx;
      let txResponse;

      while (retries < maxRetries) {
        try {
          const transaction = new AccountAllowanceApproveTransaction()
            .approveTokenAllowance(
              TokenId.fromString(process.env.TOKEN_ID),
              accountId,
              spenderAccountId,
              price * Math.pow(10, TOKEN_DECIMAL)
            )
            .freezeWith(this.client);
          signTx = await transaction.sign(PrivateKey.fromString(privateKey));
          txResponse = await signTx.execute(this.client);
          break; // If sign transaction succeeds, exit the loop
        } catch (error) {
          console.error(`Error signing transaction: ${error}`);
          retries++;

          if (retries < maxRetries) {
            const retryDelay = 1000; // Delay in milliseconds before retrying
            console.log(`Retrying in ${retryDelay / 1000} seconds...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          } else {
            console.error("Max retries reached. Exiting...");
            throw error; // Throw the error to be handled at a higher level
          }
        }
      }

      const receipt = await txResponse.getReceipt(this.client);
      const newTransaction = new Transaction();
      newTransaction.transactionType = TransactionType.ApproveToken;
      newTransaction.accountId = accountId;
      newTransaction.transactionId = signTx?.transactionId?.toString();
      newTransaction.content = JSON.stringify({ price: price, royalty: 0 });
      newTransaction.status = Boolean(receipt.status);
      return newTransaction;
    } catch (error) {
      console.log("error", error);
      throw new HttpException(
        { message: "approveToken - Not enough of token balance" },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  public async putNFTToMarketPlace(
    NFTSmartContractId: string,
    tokenId: number,
    paymentTokenSCId: string,
    price: number
  ): Promise<ITransactionExecuted> {
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);
    const paymentTokenSCAddress =
      hethers.utils.getAddressFromAccount(paymentTokenSCId);

    const blockchainResponse = await this.execFunctionOnSC(
      process.env.MARKET_SMART_CONTRACT,
      ListFunctionNFTMarketPlaceSC.PutNFTOnSale,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
        .addAddress(paymentTokenSCAddress)
        .addInt64(
          new BigNumber(price).times(new BigNumber(10).pow(TOKEN_DECIMAL))
        )
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.SaleAtFixedPrice,
      JSON.stringify({ price: 0, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction: null,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async putNFTOffFromMarketPlace(
    NFTSmartContractId: string,
    tokenId: number
  ): Promise<ITransactionExecuted> {
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);

    const blockchainResponse = await this.execFunctionOnSC(
      process.env.MARKET_SMART_CONTRACT,
      ListFunctionNFTMarketPlaceSC.PutNFTOffSale,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.CancelSaleAtFixedPrice,
      JSON.stringify({ price: 0, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction: null,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async buyNFT(
    NFTSmartContractId: string,
    paymentTokenSCId: string,
    tokenId: number,
    price: number,
    point: number,
    receiverAccountId: string,
    tokenName: string
  ): Promise<ITransactionExecuted> {
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);
    const paymentTokenSCAddress =
      hethers.utils.getAddressFromAccount(paymentTokenSCId);

    const blockchainResponse = await this.execFunctionOnSC(
      process.env.MARKET_SMART_CONTRACT,
      ListFunctionNFTMarketPlaceSC.BuyNFT,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
        .addAddress(paymentTokenSCAddress)
        .addInt64(
          new BigNumber(price).times(new BigNumber(10).pow(TOKEN_DECIMAL))
        )
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.PurchasedNFT,
      JSON.stringify({ price: -price, point: point, tokenName, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    if (!blockchainResponse.status)
      return {
        senderTransaction,
        receiverTransaction: null,
        message: blockchainResponse.message,
        status: blockchainResponse.status,
      };

    const receiverTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ReceiveTokenFromSaleAtFixedPrice,
      JSON.stringify({
        price: price,
        point: -point,
        tokenName,
        royalty: NftService.calculateRoyalty(price),
      }),
      receiverAccountId,
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );
    return {
      senderTransaction,
      receiverTransaction,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async makeOffer(
    NFTSmartContractId: string,
    tokenId: number,
    paymentTokenSCId: string,
    price: number
  ): Promise<ITransactionExecuted> {
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);
    const paymentTokenSCAddress =
      hethers.utils.getAddressFromAccount(paymentTokenSCId);

    const blockchainResponse = await this.execFunctionOnSC(
      process.env.MARKET_SMART_CONTRACT,
      ListFunctionNFTMarketPlaceSC.MakeOffer,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
        .addAddress(paymentTokenSCAddress)
        .addInt64(
          new BigNumber(price).times(new BigNumber(10).pow(TOKEN_DECIMAL))
        )
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.SendOffer,
      JSON.stringify({ price: -price, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction: null,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async approveOffer(
    NFTSmartContractId: string,
    tokenId: number,
    ownerOfferWalletAddress: string,
    price: number,
    point: number,
    receiverAccountId: string
  ): Promise<ITransactionExecuted> {
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);

    const blockchainResponse = await this.execFunctionOnSC(
      process.env.MARKET_SMART_CONTRACT,
      ListFunctionNFTMarketPlaceSC.AcceptOfferNFT,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
        .addAddress(ownerOfferWalletAddress)
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ApproveOffer,
      JSON.stringify({
        price: price,
        point: -point,
        royalty: NftService.calculateRoyalty(price),
      }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    if (!blockchainResponse.status)
      return {
        senderTransaction,
        receiverTransaction: null,
        message: blockchainResponse.message,
        status: blockchainResponse.status,
      };

    const receiverTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ReceiveNFTFromOffer,
      JSON.stringify({ price: -price, point: point, royalty: 0 }),
      receiverAccountId,
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async cancelOffer(
    NFTSmartContractId: string,
    tokenId: number,
    price: number
  ): Promise<ITransactionExecuted> {
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);

    const blockchainResponse = await this.execFunctionOnSC(
      process.env.MARKET_SMART_CONTRACT,
      ListFunctionNFTMarketPlaceSC.CancelOffer,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.CancelSaleWithOffer,
      JSON.stringify({ price: price, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction: null,
      status: blockchainResponse.status,
      message: blockchainResponse.message,
    };
  }

  public async createAuction(
    NFTSmartContractId: string,
    tokenId: number,
    paymentTokenSCId: string,
    startPrice: number,
    winningPrice: number,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<ITransactionExecuted> {
    const minimumBid = 1;
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);
    const paymentTokenSCAddress =
      hethers.utils.getAddressFromAccount(paymentTokenSCId);

    const blockchainResponse = await this.execFunctionOnSC(
      process.env.AUCTION_SMART_CONTRACT,
      ListFunctionAuctionSC.CreateAuction,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
        .addAddress(paymentTokenSCAddress)
        .addInt64(
          new BigNumber(startPrice).times(new BigNumber(10).pow(TOKEN_DECIMAL))
        )
        .addInt64(
          new BigNumber(winningPrice).times(
            new BigNumber(10).pow(TOKEN_DECIMAL)
          )
        )
        .addInt64(
          new BigNumber(minimumBid).times(new BigNumber(10).pow(TOKEN_DECIMAL))
        )
        .addInt64(new BigNumber(startTimestamp))
        .addInt64(new BigNumber(endTimestamp))
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.SaleNFTWithAuction,
      JSON.stringify({ price: 0, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction: null,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async cancelNFTAuction(
    NFTSmartContractId: string,
    tokenId: number
  ): Promise<ITransactionExecuted> {
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);

    const blockchainResponse = await this.execFunctionOnSC(
      process.env.AUCTION_SMART_CONTRACT,
      ListFunctionAuctionSC.CancelAuction,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.CancelSaleAuction,
      JSON.stringify({ price: 0, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction: null,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async placeBid(
    NFTSmartContractId: string,
    tokenId: number,
    price: number
  ): Promise<ITransactionExecuted> {
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);
    const blockchainResponse = await this.execFunctionOnSC(
      process.env.AUCTION_SMART_CONTRACT,
      ListFunctionAuctionSC.PlaceBid,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
        .addInt64(
          new BigNumber(price).times(new BigNumber(10).pow(TOKEN_DECIMAL))
        )
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.SendAuction,
      JSON.stringify({ price: -price, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction: null,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async completeAuction(
    NFTSmartContractId: string,
    tokenId: number,
    price: number,
    point: number,
    receiverAccountId: string
  ): Promise<ITransactionExecuted> {
    const NFTSmartContractAddress =
      hethers.utils.getAddressFromAccount(NFTSmartContractId);
    const blockchainResponse = await this.execFunctionOnSC(
      process.env.AUCTION_SMART_CONTRACT,
      ListFunctionAuctionSC.CompleteAuction,
      new ContractFunctionParameters()
        .addAddress(NFTSmartContractAddress)
        .addInt64(new BigNumber(tokenId))
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ReceiveTokenFromAuction,
      JSON.stringify({
        price: price,
        point: -point,
        royalty: NftService.calculateRoyalty(price),
      }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    if (!blockchainResponse.status)
      return {
        senderTransaction,
        receiverTransaction: null,
        message: blockchainResponse.message,
        status: blockchainResponse.status,
      };

    const receiverTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ReceiveNFTFromAuction,
      JSON.stringify({ price: -price, point: point, royalty: 0 }),
      receiverAccountId,
      blockchainResponse.status,
      blockchainResponse.message,
      tokenId
    );

    return {
      senderTransaction,
      receiverTransaction,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async getTransactionFee(transactionId: string): Promise<string> {
    try {
      const transactionRecord = await new TransactionRecordQuery()
        .setTransactionId(transactionId)
        .execute(this.client);
      return transactionRecord.transactionFee.toBigNumber().toString();
    } catch (error) {
      return undefined;
    }
  }

  public async sendTokenRewardForLearner(
    receiver: string,
    amount: number,
    receiverAccountId: string
  ): Promise<ITransactionExecuted> {
    const blockchainResponse = await this.execFunctionOnSC(
      process.env.TOKEN_SMART_CONTRACT,
      ListFunctionKLAYTNSCSupported.Transfer,
      new ContractFunctionParameters()
        .addAddress(
          hethers.utils.getAddressFromAccount(
            process.env.HEDERA_ADMIN_ACCOUNT_ID
          )
        )
        .addAddress(receiver)
        .addInt64(
          new BigNumber(amount).times(new BigNumber(10).pow(TOKEN_DECIMAL))
        )
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.SendTokenForLearner,
      JSON.stringify({ price: -amount, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message
    );

    if (!blockchainResponse.status)
      return {
        senderTransaction,
        receiverTransaction: null,
        message: blockchainResponse.message,
        status: blockchainResponse.status,
      };

    const receiverTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ReceiveTokenFromLearning,
      JSON.stringify({ price: amount, point: 0, royalty: 0 }),
      receiverAccountId,
      blockchainResponse.status,
      blockchainResponse.message
    );

    return {
      senderTransaction,
      receiverTransaction,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async sendTokenRewardForEstimation(
    receiver: string,
    amount: number,
    receiverAccountId: string
  ): Promise<ITransactionExecuted> {
    const blockchainResponse = await this.execFunctionOnSC(
      process.env.TOKEN_SMART_CONTRACT,
      ListFunctionKLAYTNSCSupported.Transfer,
      new ContractFunctionParameters()
        .addAddress(
          hethers.utils.getAddressFromAccount(
            process.env.HEDERA_ADMIN_ACCOUNT_ID
          )
        )
        .addAddress(receiver)
        .addInt64(
          new BigNumber(amount).times(new BigNumber(10).pow(TOKEN_DECIMAL))
        )
    );

    const senderTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.SendTokenForEstimation,
      JSON.stringify({ price: -amount, point: 0, royalty: 0 }),
      this.client._operator.accountId.toString(),
      blockchainResponse.status,
      blockchainResponse.message
    );

    if (!blockchainResponse.status)
      return {
        senderTransaction,
        receiverTransaction: null,
        message: blockchainResponse.message,
        status: blockchainResponse.status,
      };

    const receiverTransaction = HederaLib.createTransaction(
      blockchainResponse.transactionId,
      TransactionType.ReceiveTokenFromEstimation,
      JSON.stringify({ price: amount, point: 0, royalty: 0 }),
      receiverAccountId,
      blockchainResponse.status,
      blockchainResponse.message
    );

    return {
      senderTransaction,
      receiverTransaction,
      message: blockchainResponse.message,
      status: blockchainResponse.status,
    };
  }

  public async mintTokenForAdmin(): Promise<void> {
    const response = await this.execFunctionOnSC(
      process.env.TOKEN_SMART_CONTRACT,
      "mint",
      new ContractFunctionParameters()
        .addAddress(
          hethers.utils.getAddressFromAccount(
            process.env.HEDERA_ADMIN_ACCOUNT_ID
          )
        )
        .addInt64(new BigNumber(1000000000000))
    );
  }

  public async updateUserPoint(
    userId: string,
    point: number,
    userPointRepository: UserPointRepository,
    nftType: NFTType
  ): Promise<void> {
    let pointType = PointType.Client;
    if (nftType === NFTType.Agent) pointType = PointType.Agent;
    if (nftType === NFTType.Referral) pointType = PointType.Referral;

    point = Number(point);
    try {
      const userPoint = await userPointRepository.getUserPointByUserId(
        userId,
        pointType
      );
      if (!userPoint) {
        const newUserPoint = new UserPoint();
        newUserPoint.point = point;
        newUserPoint.userId = userId;
        newUserPoint.pointType = pointType;
        await userPointRepository.save(newUserPoint);
      } else {
        userPoint.point += point;
        userPoint.updatedAt = new Date();
        await userPointRepository.save(userPoint);
      }
    } catch (error) {
      console.log(`Error user point`, error.message);
    }
  }
}
