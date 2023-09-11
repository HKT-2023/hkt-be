import { Module, CacheModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/models/schemas/user.schema";
import { NftService } from "src/modules/nft/nft.service";
import { NftController } from "src/modules/nft/nft.controller";
import { Nft, NftSchema } from "src/models/schemas/nft.schema";
import {
  NftSellingConfig,
  NftSellingConfigSchema,
} from "src/models/schemas/nft-selling-configs.schema";
import { NftConsole } from "src/modules/nft/nft.console";
import { Offer, OfferSchema } from "src/models/schemas/offer.schema";
import { HederaLib } from "src/libs/hedera.lib";
import { Wallet, WalletSchema } from "src/models/schemas/wallet.schema";
import {
  Transaction,
  TransactionSchema,
} from "src/models/schemas/transaction.schema";
import { Bid, BidSchema } from "src/models/schemas/bid.schema";
import {
  UserPoint,
  UserPointSchema,
} from "src/models/schemas/user-point.schema";

@Module({
  imports: [
    CacheModule.register({ ttl: 86400 }),
    MongooseModule.forFeature([
      { name: UserPoint.name, schema: UserPointSchema },
      { name: Bid.name, schema: BidSchema },
      { name: User.name, schema: UserSchema },
      { name: Nft.name, schema: NftSchema },
      { name: NftSellingConfig.name, schema: NftSellingConfigSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [NftController],
  providers: [NftService, NftConsole, HederaLib],
})
export class NftModule {}
