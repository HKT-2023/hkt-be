import { CacheModule, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from "@nestjs/axios";
import { SendgridLib } from "src/libs/sendgrid.lib";
import { ActivityController } from "src/modules/activity/activity.controller";
import { Transaction } from "@hashgraph/sdk";
import { TransactionSchema } from "src/models/schemas/transaction.schema";
import { ActivityService } from "src/modules/activity/activity.service";
import { ActivityConsole } from "src/modules/activity/activity.console";
import { HederaLib } from "src/libs/hedera.lib";
import { Nft, NftSchema } from "src/models/schemas/nft.schema";
import { WalletRepository } from "src/models/repositories/wallet.repository";
import { Wallet, WalletSchema } from "src/models/schemas/wallet.schema";

@Module({
  imports: [
    CacheModule.register({ ttl: 86400 }),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Nft.name, schema: NftSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
    HttpModule,
  ],
  controllers: [ActivityController],
  providers: [
    ActivityService,
    SendgridLib,
    ActivityConsole,
    HederaLib,
    WalletRepository,
  ],
})
export class ActivityModule {}
