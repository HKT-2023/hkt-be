import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HederaLib } from "src/libs/hedera.lib";
import { WalletRepository } from "src/models/repositories/wallet.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Wallet, WalletDocument } from "src/models/schemas/wallet.schema";
import { Model } from "mongoose";
import { Nft, NftDocument } from "src/models/schemas/nft.schema";
import { NftRepository } from "src/models/repositories/nft.repository";
import { SendTokenDto } from "src/modules/wallet/dto/send-token.dto";
import {
  Transaction,
  TransactionDocument,
} from "src/models/schemas/transaction.schema";
import { WalletMessageError } from "src/modules/wallet/wallet.const";
import { TransactionRepository } from "src/models/repositories/transaction.repository";
import { SendNFTDto } from "src/modules/wallet/dto/send-NFT.dto";
import { NftMessageError } from "src/modules/nft/nft.const";
import { NftSellingConfigsRepository } from "src/models/repositories/nft-selling-configs.repository";
import {
  MappingSellingConfigType,
  NftSellingConfig,
  NftSellingConfigDocument,
  NftSellingConfigStatus,
} from "src/models/schemas/nft-selling-configs.schema";
import { NftService } from "src/modules/nft/nft.service";
import { UserRepository } from "src/models/repositories/user.repository";
import { User, UserDocument } from "src/models/schemas/user.schema";
import { ListMyNftDto } from "src/modules/wallet/dto/list-my-nft.dto";
import { UserPointRepository } from "src/models/repositories/user-point.repository";
import {
  UserPoint,
  UserPointDocument,
} from "src/models/schemas/user-point.schema";
import { TypeOfUser } from "src/modules/user/user.const";
const CryptoJS = require("crypto-js");

@Injectable()
export class WalletService {
  private readonly userPointRepository: UserPointRepository;
  private readonly walletRepository: WalletRepository;
  private readonly userRepository: UserRepository;
  private readonly transactionRepository: TransactionRepository;
  private readonly nftSellingConfigsRepository: NftSellingConfigsRepository;
  private readonly nftRepository: NftRepository;
  constructor(
    @InjectModel(UserPoint.name)
    private readonly userPointModel: Model<UserPointDocument>,
    private readonly hederaLib: HederaLib,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(Nft.name)
    private readonly nftModel: Model<NftDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(NftSellingConfig.name)
    private readonly nftSellingConfigModel: Model<NftSellingConfigDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {
    this.userPointRepository = new UserPointRepository(this.userPointModel);
    this.walletRepository = new WalletRepository(this.walletModel);
    this.userRepository = new UserRepository(this.userModel);
    this.transactionRepository = new TransactionRepository(
      this.transactionModel
    );
    this.nftRepository = new NftRepository(this.nftModel);
    this.nftSellingConfigsRepository = new NftSellingConfigsRepository(
      this.nftSellingConfigModel
    );
  }

  public static decodeWalletPrivateKey(
    encryptWalletPrivateKey: string
  ): string {
    return CryptoJS.AES.decrypt(
      encryptWalletPrivateKey,
      process.env.HEDERA_SECRET_KEY_ENCRYPT
    ).toString(CryptoJS.enc.Utf8);
  }

  public async sendToken(
    userId: string,
    sendTokenDto: SendTokenDto
  ): Promise<Transaction> {
    if (sendTokenDto.amount < 5) {
      throw new HttpException(
        { message: WalletMessageError.MinimumSendToken },
        HttpStatus.BAD_REQUEST
      );
    }
    const userWallet = await this.walletRepository.getWalletByUserId(userId);
    const receiverWallet = await this.walletRepository.getWalletByAccountId(
      sendTokenDto.accountId
    );

    if (!receiverWallet) {
      throw new HttpException(
        { message: WalletMessageError.ReceiveWalletNotFound },
        HttpStatus.BAD_REQUEST
      );
    }

    if (userWallet.accountId === receiverWallet.accountId) {
      throw new HttpException(
        { message: WalletMessageError.SameWallet },
        HttpStatus.BAD_REQUEST
      );
    }

    const decodePrivateKey = WalletService.decodeWalletPrivateKey(
      userWallet.privateKey
    );

    await this.hederaLib.setOperator(userWallet.accountId, decodePrivateKey);
    const approveTokenTransaction = await this.hederaLib.approveToken(
      sendTokenDto.amount,
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey),
      process.env.TOKEN_SMART_CONTRACT
    );
    await this.transactionRepository.save(approveTokenTransaction);
    const transactions = await this.hederaLib.sendToken(
      userWallet.address,
      receiverWallet.address,
      sendTokenDto.amount,
      receiverWallet.accountId
    );

    transactions.senderTransaction.memo = sendTokenDto.memo;
    const senderTransaction = await this.transactionRepository.save(
      transactions.senderTransaction
    );

    if (!transactions.status) {
      throw new HttpException(
        { message: "Not enough token balance for transfer" },
        HttpStatus.BAD_REQUEST
      );
    }

    transactions.receiverTransaction.memo = sendTokenDto.memo;
    await this.transactionRepository.save(transactions.receiverTransaction);
    return senderTransaction;
  }

  public async sendNFT(
    userId: string,
    sendNFTDto: SendNFTDto
  ): Promise<Transaction | boolean> {
    const NFT = await this.nftRepository.getNFTById(sendNFTDto.NFTId);
    const userWallet = await this.walletRepository.getWalletByUserId(userId);
    const receiverWallet = await this.walletRepository.getWalletByAccountId(
      sendNFTDto.receiveAccount
    );

    if (!receiverWallet) {
      throw new HttpException(
        { message: WalletMessageError.ReceiveWalletNotFound },
        HttpStatus.BAD_REQUEST
      );
    }

    const receiver = await this.userRepository.getUserById(
      receiverWallet.userId
    );

    if (userWallet.accountId === receiverWallet.accountId) {
      throw new HttpException(
        { message: WalletMessageError.SameWallet },
        HttpStatus.BAD_REQUEST
      );
    }
    if (!NFT) {
      throw new HttpException(
        { message: NftMessageError.NftNotFound },
        HttpStatus.BAD_REQUEST
      );
    }

    const currentSellingConfig =
      await this.nftSellingConfigsRepository.getActiveConfigActiveByNftId(
        NFT._id
      );
    if (currentSellingConfig) {
      throw new HttpException(
        { message: WalletMessageError.CurrentNFTSelling },
        HttpStatus.BAD_REQUEST
      );
    }

    if (NFT.userId !== userId) {
      throw new HttpException(
        { message: WalletMessageError.NotOwnerNFT },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!receiverWallet) {
      throw new HttpException(
        { message: WalletMessageError.ReceiveWalletNotFound },
        HttpStatus.BAD_REQUEST
      );
    }

    const decodePrivateKey = WalletService.decodeWalletPrivateKey(
      userWallet.privateKey
    );

    await this.hederaLib.setOperator(userWallet.accountId, decodePrivateKey);
    const approveNFTTransaction = await this.hederaLib.approveNFT(
      NFT.tokenId,
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey),
      process.env.NFT_SMART_CONTRACT
    );
    await this.transactionRepository.save(approveNFTTransaction);
    const transactions = await this.hederaLib.sendNFT(
      userWallet.address,
      receiverWallet.address,
      NFT.tokenId,
      NFT.point,
      NFT.name,
      receiverWallet.accountId
    );

    transactions.senderTransaction.memo = sendNFTDto.memo;
    const senderTransaction = await this.transactionRepository.save(
      transactions.senderTransaction
    );

    if (!transactions.status) {
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    const buyer = await this.userRepository.getUserById(receiverWallet.userId);
    if (buyer.typeOfUser === TypeOfUser.KlaytnAgent)
      await this.hederaLib.updateUserPoint(
        receiverWallet.userId,
        NFT.point,
        this.userPointRepository,
        NFT.nftType
      );

    const seller = await this.userRepository.getUserById(receiverWallet.userId);
    if (seller.typeOfUser === TypeOfUser.KlaytnAgent)
      await this.hederaLib.updateUserPoint(
        receiverWallet.userId,
        -NFT.point,
        this.userPointRepository,
        NFT.nftType
      );

    NFT.userId = receiverWallet.userId;
    NFT.ownerName = NftService.getOwnerNFTName(receiver);
    NFT.ownerAccountId = receiverWallet.accountId;
    NFT.ownerAddress = receiverWallet.address;
    NFT.updatedAt = new Date();

    transactions.receiverTransaction.memo = sendNFTDto.memo;
    await this.transactionRepository.save(transactions.receiverTransaction);
    await this.nftRepository.save(NFT);
    return senderTransaction;
  }

  public async getOrCreateWallet(userId: string): Promise<Wallet> {
    const existUserWallet = await this.walletRepository.getWalletByUserId(
      userId,
      ["-privateKey"]
    );

    if (existUserWallet) {
      existUserWallet.point = await this.nftRepository.getTotalPointByUser(
        userId
      );
      return existUserWallet;
    }

    const newWallet = await this.hederaLib.createNewAccount(userId);
    await this.walletRepository.save(newWallet);
    return this.walletRepository.getWalletByUserId(userId, ["-privateKey"]);
  }

  public async viewNFTInWallet(
    userId: string,
    listMyNftDto: ListMyNftDto
  ): Promise<{ NFTs: Nft[]; total: number }> {
    const userWallet = await this.walletRepository.getWalletByUserId(userId);
    if (!userWallet)
      return {
        NFTs: [],
        total: 0,
      };
    const NFTs = await this.nftRepository.getListNFTByWallet(
      userWallet.address,
      listMyNftDto
    );
    for (const NFT of NFTs) {
      if (NFT.saleStatus === NftSellingConfigStatus.Active) {
        NFT.salesType = {
          key: NFT.putSaleType,
          title: MappingSellingConfigType[NFT.putSaleType],
        };
        continue;
      }
      NFT.salesType = {
        key: null,
        title: null,
      };
    }
    const totalNFT = await this.nftRepository.countNFTByWallet(
      userWallet.address,
      listMyNftDto
    );
    return {
      NFTs,
      total: totalNFT,
    };
  }

  public async viewDetailNFT(userId: string, NFTId: string): Promise<Nft> {
    const NFT = await this.nftRepository.getNFTById(NFTId);

    const currentSellingConfig =
      await this.nftSellingConfigsRepository.getActiveConfigActiveByNftId(
        NFT._id
      );

    NFT.sellingConfigId = null;
    if (currentSellingConfig) {
      NFT.salesType = {
        key: currentSellingConfig.type,
        title: MappingSellingConfigType[currentSellingConfig.type],
      };
      NFT.sellingConfigId = currentSellingConfig._id;
    }

    return NFT;
  }
}
