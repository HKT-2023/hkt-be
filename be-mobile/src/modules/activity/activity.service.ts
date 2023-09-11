import { Model } from "mongoose";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { TransactionRepository } from "src/models/repositories/transaction.repository";
import {
  Transaction,
  TransactionDocument,
  TransactionTypeMapping,
} from "src/models/schemas/transaction.schema";
import { GetActivitiesDto } from "src/modules/activity/dto";
import { IActivity } from "src/modules/activity/activity.interface";
import { ActivityMessageError } from "src/modules/activity/activity.const";
import { NftRepository } from "src/models/repositories/nft.repository";
import { Nft, NftDocument } from "src/models/schemas/nft.schema";
import { Wallet, WalletDocument } from "src/models/schemas/wallet.schema";
import { WalletRepository } from "src/models/repositories/wallet.repository";
@Injectable()
export class ActivityService {
  private transactionRepository: TransactionRepository;
  private nftRepository: NftRepository;
  private walletRepository: WalletRepository;

  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Nft.name)
    private readonly nftModel: Model<NftDocument>,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>
  ) {
    this.transactionRepository = new TransactionRepository(
      this.transactionModel
    );
    this.nftRepository = new NftRepository(this.nftModel);
    this.walletRepository = new WalletRepository(this.walletModel);
  }

  public async getListTransaction(
    userId: string,
    getActivitiesDto: GetActivitiesDto
  ): Promise<{ activities: any; totalActivities: number }> {
    if (getActivitiesDto.type) {
      getActivitiesDto.types = getActivitiesDto.type.split(",");
    }

    const wallet = await this.walletRepository.getWalletByUserId(userId);

    const activities = await this.transactionRepository.getActivitiesByUserId(
      wallet.accountId,
      getActivitiesDto
    );

    return {
      activities: activities.map((activity) => {
        return {
          transactionType: activity.transactionType,
          transactionDescription:
            TransactionTypeMapping[activity.transactionType],
          transactionId: activity.transactionId,
          content: JSON.parse(activity.content),
          _id: activity._id,
          accountId: activity.accountId,
          updatedAt: activity.updatedAt,
          createdAt: activity.createdAt,
          memo: activity?.memo,
          gasFee: activity.gasFee,
          status: activity.status,
        };
      }),
      totalActivities: activities.length,
    };
  }

  public async getDetailActivity(id: string): Promise<IActivity> {
    // condition filter
    const activity = await this.transactionRepository.getDetailById(id);

    if (!activity) {
      throw new HttpException(
        { message: ActivityMessageError.GetDetailFailed },
        HttpStatus.BAD_REQUEST
      );
    }

    const NFT = await this.nftRepository.getNFTByTokenId(activity.tokenId);

    return {
      transactionType: activity.transactionType,
      transactionDescription: TransactionTypeMapping[activity.transactionType],
      transactionId: activity.transactionId,
      content: activity.content ? JSON.parse(activity?.content) : null,
      _id: activity._id,
      accountId: activity.accountId,
      updatedAt: activity.updatedAt,
      createdAt: activity.createdAt,
      memo: activity?.memo,
      gasFee: activity.gasFee,
      status: activity.status,
      nftName: NFT ? NFT.name : null,
      royalty: activity.royalty ? activity.royalty : null,
    };
  }
}
