import { Module } from "@nestjs/common";
import { WalletController } from "src/modules/wallet/wallet.controller";
import { WalletService } from "src/modules/wallet/wallet.service";
import { HederaLib } from "src/libs/hedera.lib";
import { MongooseModule } from "@nestjs/mongoose";
import { Wallet, WalletSchema } from "src/models/schemas/wallet.schema";
import { Nft, NftSchema } from "src/models/schemas/nft.schema";
import {
  Transaction,
  TransactionSchema,
} from "src/models/schemas/transaction.schema";
import {
  NftSellingConfig,
  NftSellingConfigSchema,
} from "src/models/schemas/nft-selling-configs.schema";
import { User, UserSchema } from "src/models/schemas/user.schema";
import {
  UserPoint,
  UserPointSchema,
} from "src/models/schemas/user-point.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPoint.name, schema: UserPointSchema },
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Nft.name, schema: NftSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: NftSellingConfig.name, schema: NftSellingConfigSchema },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService, HederaLib],
})
export class WalletModule {}
