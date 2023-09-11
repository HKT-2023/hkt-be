import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import {
  MappingSellingConfigType,
  NftSellingConfig,
  NftSellingConfigDocument,
  NftSellingConfigStatus,
  NftSellingConfigType,
} from "src/models/schemas/nft-selling-configs.schema";
import { Nft, NftDocument } from "src/models/schemas/nft.schema";
import { NftRepository } from "src/models/repositories/nft.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  ESTIMATE_GAS_FEE_KEY,
  NftMessageError,
} from "src/modules/nft/nft.const";
import { NftSellingConfigsRepository } from "src/models/repositories/nft-selling-configs.repository";
import {
  Offer,
  OfferDocument,
  OfferStatus,
} from "src/models/schemas/offer.schema";
import { OfferRepository } from "src/models/repositories/offer.repository";
import { HederaLib } from "src/libs/hedera.lib";
import { Wallet, WalletDocument } from "src/models/schemas/wallet.schema";
import { WalletRepository } from "src/models/repositories/wallet.repository";
import { WalletService } from "src/modules/wallet/wallet.service";
import {
  Transaction,
  TransactionDocument,
  TransactionType,
} from "src/models/schemas/transaction.schema";
import { TransactionRepository } from "src/models/repositories/transaction.repository";
import { NFTMarketPlaceDto } from "src/modules/nft/dto/NFT-market-place.dto";
import { User, UserDocument } from "src/models/schemas/user.schema";
import { UserRepository } from "src/models/repositories/user.repository";
import { MakeBidDto } from "src/modules/nft/dto/make-bid.dto";
import { BidRepository } from "src/models/repositories/bid.repository";
import { Bid, BidDocument, BidStatus } from "src/models/schemas/bid.schema";
import { WalletMessageError } from "src/modules/wallet/wallet.const";
import { MintNftDto } from "src/modules/nft/dto/mint-nft.dto";
import { UserPointRepository } from "src/models/repositories/user-point.repository";
import {
  UserPoint,
  UserPointDocument,
} from "src/models/schemas/user-point.schema";
import { TypeOfUser } from "src/modules/user/user.const";

@Injectable()
export class NftService {
  private readonly userPointRepository: UserPointRepository;
  private readonly bidRepository: BidRepository;
  private readonly nftRepository: NftRepository;
  private readonly nftSellingConfigsRepository: NftSellingConfigsRepository;
  private readonly offerRepository: OfferRepository;
  private readonly walletRepository: WalletRepository;
  private readonly transactionRepository: TransactionRepository;
  private readonly userRepository: UserRepository;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly hederaLib: HederaLib,
    @InjectModel(UserPoint.name)
    private readonly userPointModel: Model<UserPointDocument>,
    @InjectModel(Nft.name)
    private readonly nftModel: Model<NftDocument>,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(NftSellingConfig.name)
    private readonly nftSellingConfigModel: Model<NftSellingConfigDocument>,
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Bid.name)
    private readonly bidModel: Model<BidDocument>
  ) {
    this.userPointRepository = new UserPointRepository(this.userPointModel);
    this.nftRepository = new NftRepository(this.nftModel);
    this.nftSellingConfigsRepository = new NftSellingConfigsRepository(
      this.nftSellingConfigModel
    );
    this.offerRepository = new OfferRepository(this.offerModel);
    this.walletRepository = new WalletRepository(this.walletModel);
    this.transactionRepository = new TransactionRepository(
      this.transactionModel
    );
    this.userRepository = new UserRepository(this.userModel);
    this.bidRepository = new BidRepository(this.bidModel);
  }

  public static calculateRoyalty(KLAYTNTokenAmount: number): number {
    return (KLAYTNTokenAmount * 5) / 100;
  }

  public static getOwnerNFTName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  private async getNftOrFailedById(nftId: string): Promise<Nft> {
    const nft = await this.nftRepository.getNFTById(nftId);
    if (!nft) {
      throw new HttpException(
        { message: NftMessageError.NftNotFound },
        HttpStatus.BAD_REQUEST
      );
    }
    return nft;
  }

  //===================================================================================================================/

  private static async validateOwnerSellingConfig(
    nftSellingConfig: NftSellingConfig,
    userId: string
  ): Promise<void> {
    if (nftSellingConfig.userId !== userId) {
      throw new HttpException(
        { message: NftMessageError.NotOwnerSellingConfig },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  //===================================================================================================================/

  private async getSellingConfigOrFailed(
    sellingConfigId: string
  ): Promise<NftSellingConfig> {
    const sellingConfig =
      await this.nftSellingConfigsRepository.getSellingConfigById(
        sellingConfigId
      );

    if (!sellingConfig) {
      throw new HttpException(
        { message: NftMessageError.NoSellingConfigFound },
        HttpStatus.NOT_FOUND
      );
    }

    return sellingConfig;
  }

  //===================================================================================================================/

  private async getOfferByIdOrFailed(offerId: string): Promise<Offer> {
    const offer = await this.offerRepository.getOfferById(offerId);

    if (!offer) {
      throw new HttpException(
        { message: NftMessageError.OfferNotFound },
        HttpStatus.NOT_FOUND
      );
    }

    return offer;
  }

  //===================================================================================================================/

  private async validatePutNftToMarket(nftId): Promise<void> {
    const existConfigSellingActive =
      await this.nftSellingConfigsRepository.getActiveConfigActiveByNftId(
        nftId
      );

    if (existConfigSellingActive) {
      throw new HttpException(
        { message: NftMessageError.NftSellingConfigExist },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  //===================================================================================================================/

  public async sellNftAtFixedPrice(
    nftId: string,
    price: number,
    userId: string
  ): Promise<NftSellingConfig> {
    if (price <= 0) {
      throw new HttpException(
        { message: WalletMessageError.InvalidAmount },
        HttpStatus.BAD_REQUEST
      );
    }
    const NFT = await this.getNftOrFailedById(nftId);
    const userWallet = await this.walletRepository.getWalletByUserId(userId);
    const user = await this.userRepository.getUserById(userId);

    if (NFT.userId !== userId) {
      throw new HttpException(
        { message: NftMessageError.NotOwnerNFT },
        HttpStatus.BAD_REQUEST
      );
    }

    await this.validatePutNftToMarket(nftId);

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );
    const newTransaction = await this.hederaLib.approveNFT(
      NFT.tokenId,
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey),
      process.env.MARKET_SMART_CONTRACT
    );
    await this.transactionRepository.save(newTransaction);

    const transactions = await this.hederaLib.putNFTToMarketPlace(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId,
      process.env.TOKEN_ID,
      price
    );

    if (!transactions.status) {
      await this.transactionRepository.save(transactions.senderTransaction);
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    await this.transactionRepository.save(transactions.senderTransaction);
    const newNftSellingConfig = new NftSellingConfig();
    newNftSellingConfig.nftId = nftId;
    newNftSellingConfig.price = price;
    newNftSellingConfig.currency = "REAL";
    newNftSellingConfig.status = NftSellingConfigStatus.Active;
    newNftSellingConfig.type = NftSellingConfigType.SellFixedPrice;
    newNftSellingConfig.userId = userId;

    NFT.price = price;
    NFT.putSaleType = NftSellingConfigType.SellFixedPrice;
    NFT.putSaleTime = new Date();
    NFT.ownerName = `${user.firstName} ${user.lastName}`;
    NFT.updatedAt = new Date();
    NFT.saleStatus = NftSellingConfigStatus.Active;

    await this.nftRepository.save(NFT);
    return this.nftSellingConfigsRepository.save(newNftSellingConfig);
  }

  //===================================================================================================================/

  public async configAuction(
    nftId: string,
    endTime: string,
    userId: string,
    winningPrice: number,
    minPrice: number
  ): Promise<NftSellingConfig> {
    if (minPrice <= 0 || winningPrice <= 0) {
      throw new HttpException(
        { message: WalletMessageError.InvalidAmount },
        HttpStatus.BAD_REQUEST
      );
    }
    if (minPrice >= winningPrice) {
      throw new HttpException(
        { message: NftMessageError.StartPriceHigherThanWinning },
        HttpStatus.BAD_REQUEST
      );
    }
    const NFT = await this.getNftOrFailedById(nftId);
    const userWallet = await this.walletRepository.getWalletByUserId(userId);
    const user = await this.userRepository.getUserById(userId);

    await this.validatePutNftToMarket(nftId);

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );
    const approveNFTTx = await this.hederaLib.approveNFT(
      NFT.tokenId,
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey),
      process.env.AUCTION_SMART_CONTRACT
    );
    await this.transactionRepository.save(approveNFTTx);
    const transactions = await this.hederaLib.createAuction(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId,
      process.env.TOKEN_ID,
      minPrice,
      winningPrice ? winningPrice : 6000000000000,
      Math.round(new Date().getTime() / 1000),
      Math.round(new Date(endTime).getTime() / 1000)
    );

    await this.transactionRepository.save(transactions.senderTransaction);
    if (!transactions.status) {
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    NFT.ownerName = `${user.firstName} ${user.lastName}`;
    NFT.saleStatus = NftSellingConfigStatus.Active;
    NFT.putSaleType = NftSellingConfigType.Bid;
    NFT.putSaleTime = new Date();
    NFT.price = minPrice;
    NFT.updatedAt = new Date();
    NFT.endDate = endTime;
    NFT.winningPrice = winningPrice;

    const newNftSellingConfig = new NftSellingConfig();
    newNftSellingConfig.nftId = nftId;
    newNftSellingConfig.currency = "REAL";
    newNftSellingConfig.endTime = endTime;
    newNftSellingConfig.startTime = new Date();
    newNftSellingConfig.status = NftSellingConfigStatus.Active;
    newNftSellingConfig.type = NftSellingConfigType.Bid;
    newNftSellingConfig.userId = userId;
    newNftSellingConfig.winningPrice = winningPrice;
    newNftSellingConfig.minPrice = minPrice;

    await this.nftRepository.save(NFT);
    return this.nftSellingConfigsRepository.save(newNftSellingConfig);
  }

  public async earlyEndAuction(
    userId: string,
    sellingConfigId: string
  ): Promise<NftSellingConfig> {
    const sellingConfig =
      await this.nftSellingConfigsRepository.getSellingConfigById(
        sellingConfigId
      );

    if (!sellingConfig || sellingConfig.userId !== userId) {
      throw new HttpException(
        { message: NftMessageError.NoSellingConfigFound },
        HttpStatus.BAD_REQUEST
      );
    }
    const NFT = await this.nftRepository.getNFTById(sellingConfig.nftId);
    const userWallet = await this.walletRepository.getWalletByUserId(
      sellingConfig.userId
    );
    const winningAuction = await this.bidRepository.getWinningBid(
      sellingConfig.nftId,
      sellingConfigId
    );

    sellingConfig.status = NftSellingConfigStatus.InActive;
    sellingConfig.updatedAt = new Date();
    NFT.saleStatus = NftSellingConfigStatus.InActive;
    NFT.updatedAt = new Date();

    if (!winningAuction) {
      const transactions = await this.hederaLib.cancelNFTAuction(
        process.env.NFT_TOKEN_ID,
        NFT.tokenId
      );
      await this.transactionRepository.save(transactions.senderTransaction);
      if (!transactions.status) {
        throw new HttpException(
          { message: transactions.message },
          HttpStatus.BAD_REQUEST
        );
      }
      await this.nftRepository.save(NFT);
      return this.nftSellingConfigsRepository.save(sellingConfig);
    }

    const winningWallet = await this.walletRepository.getWalletByUserId(
      winningAuction.userId
    );
    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );
    const transactions = await this.hederaLib.completeAuction(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId,
      NFT.price,
      NFT.point,
      winningWallet.accountId
    );

    await this.transactionRepository.save(transactions.senderTransaction);
    if (!transactions.status) {
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }
    await this.hederaLib.updateUserPoint(
      sellingConfig.userId,
      -NFT.point,
      this.userPointRepository,
      NFT.nftType
    );

    await this.hederaLib.updateUserPoint(
      winningWallet.userId,
      NFT.point,
      this.userPointRepository,
      NFT.nftType
    );

    const winner = await this.userRepository.getUserById(winningWallet.userId);
    NFT.ownerAddress = winningWallet.address;
    NFT.ownerAccountId = winningWallet.accountId;
    NFT.userId = winningWallet.userId;
    NFT.ownerName = `${winner.firstName} ${winner.lastName}`;
    await this.transactionRepository.save(transactions.receiverTransaction);
    await this.nftRepository.save(NFT);
    return this.nftSellingConfigsRepository.save(sellingConfig);
  }

  //===================================================================================================================/

  public async turnOnOffer(
    nftId: string,
    userId: string,
    price: number
  ): Promise<NftSellingConfig> {
    if (price <= 0) {
      throw new HttpException(
        { message: WalletMessageError.InvalidAmount },
        HttpStatus.BAD_REQUEST
      );
    }
    await this.getNftOrFailedById(nftId);
    await this.validatePutNftToMarket(nftId);
    const userWallet = await this.walletRepository.getWalletByUserId(userId);
    const user = await this.userRepository.getUserById(userId);

    const NFT = await this.getNftOrFailedById(nftId);

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );

    if (NFT.userId !== userId) {
      throw new HttpException(
        { message: NftMessageError.NotOwnerNFT },
        HttpStatus.BAD_REQUEST
      );
    }

    const newTransaction = await this.hederaLib.approveNFT(
      NFT.tokenId,
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey),
      process.env.MARKET_SMART_CONTRACT
    );
    await this.transactionRepository.save(newTransaction);

    const transactions = await this.hederaLib.putNFTToMarketPlace(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId,
      process.env.TOKEN_ID,
      price
    );

    if (!transactions.status) {
      await this.transactionRepository.save(transactions.senderTransaction);
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    await this.transactionRepository.save(transactions.senderTransaction);

    const newNftSellingConfig = new NftSellingConfig();
    newNftSellingConfig.nftId = nftId;
    newNftSellingConfig.currency = "REAL";
    newNftSellingConfig.status = NftSellingConfigStatus.Active;
    newNftSellingConfig.type = NftSellingConfigType.Offer;
    newNftSellingConfig.userId = userId;

    NFT.price = price;
    NFT.winningPrice = price;
    NFT.putSaleType = NftSellingConfigType.Offer;
    NFT.ownerName = `${user.firstName} ${user.lastName}`;
    NFT.putSaleTime = new Date();
    NFT.updatedAt = new Date();
    NFT.saleStatus = NftSellingConfigStatus.Active;

    await this.nftRepository.save(NFT);
    return this.nftSellingConfigsRepository.save(newNftSellingConfig);
  }

  //===================================================================================================================/
  private async cancelAuctionNFT(
    sellingConfig: NftSellingConfig,
    userId: string
  ): Promise<NftSellingConfig> {
    if (sellingConfig.userId !== userId) {
      throw new HttpException(
        { message: NftMessageError.NotOwnerSellingConfig },
        HttpStatus.BAD_REQUEST
      );
    }
    const NFT = await this.getNftOrFailedById(sellingConfig.nftId);
    const userWallet = await this.walletRepository.getWalletByUserId(userId);

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );

    const transactions = await this.hederaLib.cancelNFTAuction(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId
    );
    await this.transactionRepository.save(transactions.senderTransaction);

    if (!transactions.status) {
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    NFT.saleStatus = NftSellingConfigStatus.InActive;
    NFT.updatedAt = new Date();
    NFT.price = 0;

    sellingConfig.status = NftSellingConfigStatus.InActive;
    sellingConfig.updatedAt = new Date();
    await this.nftRepository.save(NFT);
    return this.nftSellingConfigsRepository.save(sellingConfig);
  }

  public async cancelSellingConfig(
    sellingConfigId: string,
    userId: string
  ): Promise<NftSellingConfig> {
    const sellingConfig = await this.getSellingConfigOrFailed(sellingConfigId);

    if (sellingConfig.type === NftSellingConfigType.Bid) {
      return this.cancelAuctionNFT(sellingConfig, userId);
    }

    const NFT = await this.getNftOrFailedById(sellingConfig.nftId);
    await NftService.validateOwnerSellingConfig(sellingConfig, userId);
    const userWallet = await this.walletRepository.getWalletByUserId(userId);

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );
    const transactions = await this.hederaLib.putNFTOffFromMarketPlace(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId
    );

    if (!transactions.status) {
      await this.transactionRepository.save(transactions.senderTransaction);
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }
    await this.transactionRepository.save(transactions.senderTransaction);

    const listOfferBySellingConfig =
      await this.offerRepository.getAllOfferBySellingConfig(sellingConfigId);
    for (const userOffer of listOfferBySellingConfig) {
      const userWallet = await this.walletRepository.getWalletByUserId(
        userOffer.userId
      );
      transactions.senderTransaction.transactionType =
        TransactionType.CancelSaleWithOfferNoFee;
      transactions.senderTransaction.content = JSON.stringify({
        price: userOffer.price,
        point: 0,
        royalty: 0,
      });
      transactions.senderTransaction.accountId = userWallet.accountId;
      await this.transactionRepository.save(transactions.senderTransaction);
    }

    sellingConfig.status = NftSellingConfigStatus.InActive;
    NFT.saleStatus = NftSellingConfigStatus.InActive;
    NFT.updatedAt = new Date();
    sellingConfig.updatedAt = new Date();

    await this.nftRepository.save(NFT);
    return this.nftSellingConfigsRepository.save(sellingConfig);
  }

  //===================================================================================================================/

  public async makeOffer(
    sellingConfigId: string,
    userId: string,
    price: number,
    description: string
  ): Promise<Offer> {
    if (price <= 0) {
      throw new HttpException(
        { message: WalletMessageError.InvalidAmount },
        HttpStatus.BAD_REQUEST
      );
    }
    const sellingConfig = await this.getSellingConfigOrFailed(sellingConfigId);
    const userWallet = await this.walletRepository.getWalletByUserId(userId);
    if (
      !sellingConfig ||
      sellingConfig.status === NftSellingConfigStatus.InActive
    ) {
      throw new HttpException(
        { message: NftMessageError.SellingConfigNotActive },
        HttpStatus.BAD_REQUEST
      );
    }

    if (sellingConfig.type !== NftSellingConfigType.Offer) {
      throw new HttpException(
        { message: NftMessageError.ConfigNotTypeOfOffer },
        HttpStatus.BAD_REQUEST
      );
    }

    const NFT = await this.getNftOrFailedById(sellingConfig.nftId);

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );

    const myLatestOffer = await this.offerRepository.getMyLatestOffer(
      userId,
      sellingConfigId
    );

    if (!myLatestOffer || myLatestOffer.price < price) {
      const priceApprove = !myLatestOffer ? price : price - myLatestOffer.price;
      const approveTransaction = await this.hederaLib.approveToken(
        priceApprove,
        userWallet.accountId,
        WalletService.decodeWalletPrivateKey(userWallet.privateKey),
        process.env.MARKET_SMART_CONTRACT
      );
      await this.transactionRepository.save(approveTransaction);
    }

    const transactions = await this.hederaLib.makeOffer(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId,
      process.env.TOKEN_ID,
      price
    );

    if (!transactions.status) {
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    await this.transactionRepository.save(transactions.senderTransaction);

    const newOffer = new Offer();
    newOffer.nftId = sellingConfig.nftId;
    newOffer.sellingConfigId = sellingConfig._id;
    newOffer.status = OfferStatus.Created;
    newOffer.currency = "REAL";
    newOffer.price = price;
    newOffer.description = description;
    newOffer.userId = userId;

    const offer = await this.offerRepository.save(newOffer);

    if (price >= NFT.price) {
      return this.approveOffer(offer._id, NFT.userId);
    }

    return offer;
  }

  //===================================================================================================================/

  async cancelOffer(offerId: string, userId: string): Promise<Offer> {
    const offer = await this.getOfferByIdOrFailed(offerId);
    const userWallet = await this.walletRepository.getWalletByUserId(userId);
    const NFT = await this.getNftOrFailedById(offer.nftId);

    if (offer.status === OfferStatus.Canceled) {
      throw new HttpException(
        { message: NftMessageError.OfferCancelled },
        HttpStatus.BAD_REQUEST
      );
    }

    if (offer.userId !== userId) {
      throw new HttpException(
        { message: NftMessageError.NotOwnerOffer },
        HttpStatus.BAD_REQUEST
      );
    }

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );
    const transactions = await this.hederaLib.cancelOffer(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId,
      offer.price
    );

    await this.transactionRepository.save(transactions.senderTransaction);
    if (!transactions.status) {
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }
    offer.status = OfferStatus.Canceled;
    offer.updatedAt = new Date();
    return this.offerRepository.save(offer);
  }

  //===================================================================================================================/

  async approveOffer(offerId: string, userId: string): Promise<Offer> {
    const offer = await this.getOfferByIdOrFailed(offerId);

    if (offer.status !== OfferStatus.Created) {
      throw new HttpException(
        { message: NftMessageError.OfferNotFound },
        HttpStatus.BAD_REQUEST
      );
    }

    const userOffer = await this.userRepository.getUserById(offer.userId);
    const nftSellingConfig = await this.getSellingConfigOrFailed(
      offer.sellingConfigId
    );
    await NftService.validateOwnerSellingConfig(nftSellingConfig, userId);
    const NFT = await this.getNftOrFailedById(offer.nftId);
    const ownerOfferWallet = await this.walletRepository.getWalletByUserId(
      offer.userId
    );
    const userWallet = await this.walletRepository.getWalletByUserId(userId);

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );

    const transactions = await this.hederaLib.approveOffer(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId,
      ownerOfferWallet.address,
      offer.price,
      NFT.point,
      ownerOfferWallet.accountId
    );

    await this.transactionRepository.save(transactions.senderTransaction);
    if (!transactions.status) {
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    const listCancelOffer =
      await this.offerRepository.getAllOfferBySellingConfig(
        offer.sellingConfigId
      );
    for (const cancelOffer of listCancelOffer) {
      const userWallet = await this.walletRepository.getWalletByUserId(
        cancelOffer.userId
      );
      transactions.senderTransaction.transactionType =
        TransactionType.CancelSaleWithOfferNoFee;
      transactions.senderTransaction.content = JSON.stringify({
        price: cancelOffer.price,
        point: 0,
        royalty: 0,
      });
      transactions.senderTransaction.accountId = userWallet.accountId;
      await this.transactionRepository.save(transactions.senderTransaction);
    }

    await this.hederaLib.updateUserPoint(
      ownerOfferWallet.userId,
      NFT.point,
      this.userPointRepository,
      NFT.nftType
    );

    await this.hederaLib.updateUserPoint(
      userId,
      -NFT.point,
      this.userPointRepository,
      NFT.nftType
    );

    offer.status = OfferStatus.Approved;
    offer.updatedAt = new Date();
    NFT.winningPrice = offer.price;
    NFT.saleStatus = NftSellingConfigStatus.InActive;
    NFT.ownerName = NftService.getOwnerNFTName(userOffer);
    NFT.ownerAccountId = ownerOfferWallet.accountId;
    NFT.ownerAddress = ownerOfferWallet.address;
    NFT.userId = userOffer._id;
    NFT.updatedAt = new Date();
    nftSellingConfig.status = NftSellingConfigStatus.InActive;
    nftSellingConfig.updatedAt = new Date();

    await this.nftRepository.save(NFT);
    await this.nftSellingConfigsRepository.save(nftSellingConfig);
    await this.transactionRepository.save(transactions.receiverTransaction);
    return this.offerRepository.save(offer);
  }

  //===================================================================================================================/

  async rejectOffer(offerId: string, userId: string): Promise<Offer> {
    const offer = await this.getOfferByIdOrFailed(offerId);
    const nftSellingConfig = await this.getSellingConfigOrFailed(
      offer.sellingConfigId
    );
    await NftService.validateOwnerSellingConfig(nftSellingConfig, userId);

    offer.status = OfferStatus.Rejected;
    offer.updatedAt = new Date();
    return this.offerRepository.save(offer);
  }

  //===================================================================================================================/
  public async mint(user, mintNftDto: MintNftDto): Promise<Nft> {
    const wallet = await this.walletRepository.getWalletByUserId(user.id);
    return this.mintNft(wallet, mintNftDto);
  }

  public async mintNft(wallet: Wallet, mintNftDto: MintNftDto): Promise<Nft> {
    const newNFT = new Nft();

    newNFT.images = `https://klaytn22184.s3.amazonaws.com/minhnv1/1680090886148-istockphoto-1026205392-612x612.jpg`;
    newNFT.propertyAddress = "KLAYTN";
    newNFT.salesPrice = 10;
    newNFT.salesDate = new Date();
    newNFT.theListDate = "";
    newNFT.endDate = `${new Date(new Date().getTime() + 86400)}`;
    newNFT.salesType = null;
    newNFT.price = 1;
    newNFT.point = 1;
    newNFT.winningPrice = 1;
    newNFT.agentName = "Agent name";
    newNFT.customer = "Customer";
    newNFT.tokenId = 1;
    newNFT.userId = wallet.userId;
    newNFT.contractAddress = process.env.NFT_SMART_CONTRACT;
    newNFT.ownerAccountId = wallet.accountId;
    newNFT.ownerAddress = wallet.address;

    if (mintNftDto.nftType) newNFT.nftType = mintNftDto.nftType;
    if (mintNftDto.ownerName) newNFT.ownerName = mintNftDto.ownerName;
    if (mintNftDto.images) newNFT.images = mintNftDto.images;
    if (mintNftDto.propertyAddress)
      newNFT.propertyAddress = mintNftDto.propertyAddress;
    if (mintNftDto.salesPrice) newNFT.salesPrice = mintNftDto.salesPrice;
    if (mintNftDto.salesDate) newNFT.salesDate = mintNftDto.salesDate;
    if (mintNftDto.theListDate) newNFT.theListDate = mintNftDto.theListDate;
    if (mintNftDto.endDate) newNFT.endDate = mintNftDto.endDate;
    if (mintNftDto.price) newNFT.price = mintNftDto.price;
    if (mintNftDto.point) newNFT.point = mintNftDto.point;
    if (mintNftDto.winningPrice) newNFT.winningPrice = mintNftDto.winningPrice;
    if (mintNftDto.agentName) newNFT.agentName = mintNftDto.agentName;
    if (mintNftDto.customer) newNFT.customer = mintNftDto.customer;
    if (mintNftDto.tokenId) newNFT.tokenId = mintNftDto.tokenId;

    const latestNFT = await this.nftRepository.getLatestNFT();

    if (latestNFT) {
      newNFT.tokenId += latestNFT.tokenId;
    }
    newNFT.name = `KLAYTN NFT ${newNFT.tokenId}`;
    if (mintNftDto.name) newNFT.name = mintNftDto.name;

    const newNFTCreated = await this.nftRepository.save(newNFT);

    const transactions = await this.hederaLib.mintNFT(
      wallet.address,
      newNFTCreated.tokenId,
      newNFT.point,
      wallet.accountId
    );

    if (!transactions.status) {
      await this.transactionRepository.save(transactions.senderTransaction);
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    newNFTCreated.tokenId = transactions.senderTransaction.tokenId;
    newNFTCreated.transactionId =
      transactions.receiverTransaction.transactionId;
    newNFTCreated.updatedAt = new Date();
    await this.transactionRepository.save(transactions.receiverTransaction);
    await this.transactionRepository.save(transactions.senderTransaction);
    return this.nftRepository.save(newNFTCreated);
  }

  public async buyNFTAtFixedPrice(
    sellingConfigId: string,
    userId: string
  ): Promise<Nft> {
    const userWallet = await this.walletRepository.getWalletByUserId(userId);
    const user = await this.userRepository.getUserById(userId);
    const sellingConfig =
      await this.nftSellingConfigsRepository.getSellingConfigById(
        sellingConfigId
      );

    if (
      !sellingConfig ||
      sellingConfig.status === NftSellingConfigStatus.InActive ||
      sellingConfig.type !== NftSellingConfigType.SellFixedPrice
    ) {
      throw new HttpException(
        { message: NftMessageError.SellingConfigNotActive },
        HttpStatus.BAD_REQUEST
      );
    }

    const receiverWallet = await this.walletRepository.getWalletByUserId(
      sellingConfig.userId
    );

    const NFT = await this.getNftOrFailedById(sellingConfig.nftId);

    if (NFT.userId === userId) {
      throw new HttpException(
        { message: NftMessageError.SameOwnerNFT },
        HttpStatus.BAD_REQUEST
      );
    }

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );
    const newTransaction = await this.hederaLib.approveToken(
      sellingConfig.price,
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey),
      process.env.MARKET_SMART_CONTRACT
    );
    await this.transactionRepository.save(newTransaction);

    const transactions = await this.hederaLib.buyNFT(
      process.env.NFT_TOKEN_ID,
      process.env.TOKEN_ID,
      NFT.tokenId,
      sellingConfig.price,
      NFT.point,
      receiverWallet.accountId,
      NFT.name
    );

    await this.transactionRepository.save(transactions.senderTransaction);

    if (!transactions.status) {
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    await this.hederaLib.updateUserPoint(
      userId,
      NFT.point,
      this.userPointRepository,
      NFT.nftType
    );

    await this.hederaLib.updateUserPoint(
      sellingConfig.userId,
      -NFT.point,
      this.userPointRepository,
      NFT.nftType
    );

    NFT.userId = userId;
    NFT.ownerAddress = userWallet.address;
    NFT.ownerAccountId = userWallet.accountId;
    NFT.updatedAt = new Date();
    NFT.putSaleType = null;
    NFT.putSaleTime = null;
    NFT.ownerName = NftService.getOwnerNFTName(user);
    NFT.price = 0;
    NFT.saleStatus = NftSellingConfigStatus.InActive;

    sellingConfig.status = NftSellingConfigStatus.InActive;
    sellingConfig.updatedAt = new Date();
    await this.transactionRepository.save(transactions.receiverTransaction);
    await this.nftSellingConfigsRepository.save(sellingConfig);
    return this.nftRepository.save(NFT);
  }

  public async getNFTMarketPlace(
    nftMarketPlaceDto: NFTMarketPlaceDto,
    userId: string
  ): Promise<{
    data: Nft[];
    total: number;
  }> {
    if (nftMarketPlaceDto.sellType) {
      nftMarketPlaceDto.sellTypes = nftMarketPlaceDto.sellType.split(",");
    }
    const data = await this.nftRepository.getNFTMarketPlace(
      nftMarketPlaceDto,
      userId
    );
    const listNFTIds = data.data.map((NFT) => {
      return NFT._id;
    });
    const sellingConfigs =
      await this.nftSellingConfigsRepository.getListConfigActiveByNftIds(
        listNFTIds
      );

    for (const nft of data.data) {
      const sellingConfig = sellingConfigs.find(
        (e) => e.nftId === nft._id.toString()
      );
      nft.salesType = {
        key: sellingConfig?.type,
        title: MappingSellingConfigType[sellingConfig?.type],
      };
      nft.sellingConfigId = sellingConfig?._id;
    }

    return {
      data: data.data,
      total: data.total,
    };
  }

  public async makeBid(makeBidDto: MakeBidDto, userId: string): Promise<Bid> {
    if (makeBidDto.price <= 0) {
      throw new HttpException(
        { message: WalletMessageError.InvalidAmount },
        HttpStatus.BAD_REQUEST
      );
    }
    const sellingConfig = await this.getSellingConfigOrFailed(
      makeBidDto.sellingConfigId
    );

    if (new Date().getTime() > new Date(sellingConfig.endTime).getTime()) {
      throw new HttpException(
        { message: "Auction Ended" },
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      sellingConfig.status !== NftSellingConfigStatus.Active ||
      sellingConfig.type !== NftSellingConfigType.Bid
    ) {
      throw new HttpException(
        { message: NftMessageError.NoSellingConfigFound },
        HttpStatus.BAD_REQUEST
      );
    }
    const NFT = await this.getNftOrFailedById(sellingConfig.nftId);
    const userWallet = await this.walletRepository.getWalletByUserId(userId);

    if (makeBidDto.price <= NFT.price) {
      throw new HttpException(
        { message: NftMessageError.PriceMustHigherThanCurrentBid },
        HttpStatus.BAD_REQUEST
      );
    }

    await this.hederaLib.setOperator(
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey)
    );
    const approveTokenTx = await this.hederaLib.approveToken(
      makeBidDto.price,
      userWallet.accountId,
      WalletService.decodeWalletPrivateKey(userWallet.privateKey),
      process.env.AUCTION_SMART_CONTRACT
    );
    await this.transactionRepository.save(approveTokenTx);
    let transactions = await this.hederaLib.placeBid(
      process.env.NFT_TOKEN_ID,
      NFT.tokenId,
      makeBidDto.price
    );

    await this.transactionRepository.save(transactions.senderTransaction);

    if (!transactions.status) {
      throw new HttpException(
        { message: transactions.message },
        HttpStatus.BAD_REQUEST
      );
    }

    const currentWinningBid = await this.bidRepository.getWinningBid(
      sellingConfig.nftId,
      sellingConfig._id
    );

    if (currentWinningBid) {
      const currentBidUserWallet =
        await this.walletRepository.getWalletByUserId(currentWinningBid.userId);
      transactions.senderTransaction.accountId = currentBidUserWallet.accountId;
      transactions.senderTransaction.transactionType =
        TransactionType.ReceiveTokenByLossBid;
      transactions.senderTransaction.content = JSON.stringify({
        price: currentWinningBid.price,
        point: 0,
        royalty: 0,
      });
      await this.transactionRepository.save(transactions.senderTransaction);
    }

    NFT.price = makeBidDto.price;
    NFT.updatedAt = new Date();

    const currenBid = await this.bidRepository.getUserCurrentBid(
      sellingConfig._id,
      userId
    );

    if (currenBid) {
      currenBid.price = makeBidDto.price;
      currenBid.updatedAt = new Date();
      await this.nftRepository.save(NFT);
      return this.bidRepository.save(currenBid);
    }
    const newBid = new Bid();
    newBid.nftId = NFT._id;
    newBid.userId = userId;
    newBid.price = makeBidDto.price;
    newBid.currency = "REAL";
    newBid.sellingConfigId = sellingConfig._id;
    newBid.status = BidStatus.Created;
    const result = await this.bidRepository.save(newBid);

    if (makeBidDto.price >= NFT.winningPrice) {
      const user = await this.userRepository.getUserById(userId);
      NFT.ownerAddress = userWallet.address;
      NFT.ownerAccountId = userWallet.accountId;
      NFT.saleStatus = NftSellingConfigStatus.InActive;
      NFT.userId = userId;
      NFT.ownerName = `${user.firstName} ${user.lastName}`;
      sellingConfig.status = NftSellingConfigStatus.InActive;
      sellingConfig.updatedAt = new Date();
      await this.nftSellingConfigsRepository.save(sellingConfig);

      transactions.senderTransaction.transactionType =
        TransactionType.ReceiveNFTFromAuctionNoFee;
      transactions.senderTransaction.accountId = userWallet.accountId;
      transactions.senderTransaction.content = JSON.stringify({
        price: 0,
        point: NFT.point,
        royalty: 0,
      });
      await this.transactionRepository.save(transactions.senderTransaction);
      await this.hederaLib.updateUserPoint(
        userId,
        NFT.point,
        this.userPointRepository,
        NFT.nftType
      );

      const ownerNFTUserWallet = await this.walletRepository.getWalletByUserId(
        sellingConfig.userId
      );
      transactions.senderTransaction.transactionType =
        TransactionType.ReceiveTokenFromAuctionNoFee;
      transactions.senderTransaction.accountId = ownerNFTUserWallet.accountId;
      transactions.senderTransaction.content = JSON.stringify({
        price: makeBidDto.price,
        point: -NFT.point,
        royalty: NftService.calculateRoyalty(makeBidDto.price),
      });
      await this.transactionRepository.save(transactions.senderTransaction);

      const seller = await this.userRepository.getUserById(
        sellingConfig.userId
      );
      await this.hederaLib.updateUserPoint(
        sellingConfig.userId,
        -NFT.point,
        this.userPointRepository,
        NFT.nftType
      );
    }
    await this.nftRepository.save(NFT);

    return result;
  }

  public async listOffer(
    nftId: string,
    page: number,
    limit: number
  ): Promise<{ data: { offer: Offer; userOffer: User }[]; total: number }> {
    const dataReturn = [];
    const NFTSellingConfig =
      await this.nftSellingConfigsRepository.getActiveConfigActiveByNftId(
        nftId
      );

    if (!NFTSellingConfig) {
      throw new HttpException(
        { message: NftMessageError.NoSellingConfigFound },
        HttpStatus.BAD_REQUEST
      );
    }

    const offers = await this.offerRepository.getListOffer(
      nftId,
      NFTSellingConfig._id,
      page,
      limit
    );
    const userIds = offers.map((offer) => offer.userId);
    const users = await this.userRepository.getListUserByIds(userIds, [
      "firstName",
      "lastName",
      "avatarUrl",
    ]);

    for (const offer of offers) {
      const userFound = users.find(
        (user) => user._id.toString() === offer.userId
      );
      dataReturn.push({ offer, userOffer: userFound });
    }

    const total = await this.offerRepository.totalOfferByNFT(
      nftId,
      NFTSellingConfig._id
    );

    return {
      data: dataReturn,
      total,
    };
  }

  public async listBid(
    NFTId: string,
    page: number,
    limit: number
  ): Promise<{ data: { bid: Bid; userBid: User }[]; total: number }> {
    const dataReturn = [];
    const NFTSellingConfig =
      await this.nftSellingConfigsRepository.getActiveConfigActiveByNftId(
        NFTId
      );

    if (!NFTSellingConfig) {
      throw new HttpException(
        { message: NftMessageError.NoSellingConfigFound },
        HttpStatus.BAD_REQUEST
      );
    }

    const bids = await this.bidRepository.getListBid(
      NFTId,
      NFTSellingConfig._id,
      page,
      limit
    );

    const userIds = bids.map((bid) => bid.userId);
    const users = await this.userRepository.getListUserByIds(userIds, [
      "firstName",
      "lastName",
      "avatarUrl",
    ]);

    for (const bid of bids) {
      const userFound = users.find(
        (user) => user._id.toString() === bid.userId
      );
      dataReturn.push({ bid, userBid: userFound });
    }

    const total = await this.bidRepository.totalBidByNFT(
      NFTId,
      NFTSellingConfig._id
    );
    return {
      data: dataReturn,
      total,
    };
  }

  public async getNFTSaleHistory(
    nftId: string,
    page: number,
    limit: number
  ): Promise<{
    data: { name: string; createdAt: Date; price: number }[];
    total: number;
  }> {
    const dataReturn = [];
    const NFT = await this.getNftOrFailedById(nftId);
    const transactions =
      await this.transactionRepository.getSaleHistoryByTokenId(
        NFT.tokenId,
        page,
        limit
      );

    for (const transaction of transactions) {
      const content = JSON.parse(transaction.content);
      const price = content.price ? Math.abs(content.price) : 0;
      dataReturn.push({
        name: transaction.accountId,
        createdAt: transaction.createdAt,
        price,
      });
    }

    return {
      data: dataReturn,
      total: await this.transactionRepository.getTotalSaleHistoryByTokenId(
        NFT.tokenId
      ),
    };
  }

  public async estimateFee(): Promise<{
    gasFee: number;
    royaltyPercentage: number;
  }> {
    const fiveHoursToTimestamp = 5 * 60 * 60 * 1000;
    const estimateGasFee = await this.cacheManager.get(ESTIMATE_GAS_FEE_KEY);
    if (
      !estimateGasFee ||
      // @ts-ignore
      new Date().getTime() - Number(estimateGasFee.ttl) > fiveHoursToTimestamp
    ) {
      const latestTransactionWithFee =
        await this.transactionRepository.getLatestTransactionWithFee();
      await this.cacheManager.set(ESTIMATE_GAS_FEE_KEY, {
        gasFee: latestTransactionWithFee
          ? latestTransactionWithFee.gasFee
          : process.env.HEDERA_FAULT_GAS_FEE,
        ttl: new Date().getTime() + fiveHoursToTimestamp,
      });
      return {
        gasFee: Number(latestTransactionWithFee.gasFee),
        royaltyPercentage: 5,
      };
    }
    return {
      // @ts-ignore
      gasFee: Number(estimateGasFee.gasFee),
      royaltyPercentage: 5,
    };
  }
}
