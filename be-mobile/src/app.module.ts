import { BullModule } from "@nestjs/bull";
import { ConsoleModule } from "nestjs-console";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DATABASE_CONFIG as db } from "src/configs/database.config";
import { AuthModule } from "src/modules/authentication/auth.module";
import { UserModule } from "src/modules/user/user.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "src/modules/authentication/jwt-auth.guard";
import { JwtStrategy } from "src/modules/authentication/jwt.strategy";
import { NftModule } from "src/modules/nft/nft.module";
import { SentryModule } from "@ntegral/nestjs-sentry";
import { SeederModule } from "src/modules/seeder/seeder.module";
import { FileModule } from "src/modules/file/file.module";
import { WalletModule } from "src/modules/wallet/wallet.module";
import { EstimationModule } from "src/modules/estimation/estimation.module";
import { ListingModule } from "src/modules/listing/listing.module";
import { FavoriteModule } from "src/modules/favorite/favorite.module";
import { FaqModule } from "./modules/faq/faq.module";
import { ContactAgentModule } from "src/modules/contact-agent/contact-agent.module";
import { NotificationModule } from "src/modules/notification/notification.module";
import { RequestTourModule } from "src/modules/request-tour/request-tour.module";
import { ReportListingModule } from "src/modules/report-listing/report-listing.module";
import { ActivityModule } from "src/modules/activity/activity.module";
import { CourseModule } from "src/modules/course/course.module";
import { QuizModule } from "src/modules/quiz/quiz.module";
import { LessonModule } from "src/modules/lesson/lesson.module";
import { ReviewModule } from "src/modules/review/review.module";
import { VendorCategoryModule } from "src/modules/vendor-category/vendor-category.module";

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      debug: Boolean(process.env.SENTRY_DEBUG_LOG),
      environment: process.env.NODE_ENV,
      release: process.env.SENTRY_RELEASE,
      // @ts-ignore
      logLevels: [process.env.LOG_LEVEL],
    }),
    MongooseModule.forRoot(
      `mongodb://${db.userName}:${db.password}@${db.host}:${db.port}/${db.databaseName}?authSource=${db.databaseName}`
    ),
    UserModule,
    AuthModule,
    ConsoleModule,
    NftModule,
    SeederModule,
    FileModule,
    WalletModule,
    EstimationModule,
    ListingModule,
    FavoriteModule,
    FaqModule,
    ContactAgentModule,
    NotificationModule,
    RequestTourModule,
    ReportListingModule,
    ActivityModule,
    CourseModule,
    QuizModule,
    LessonModule,
    ReviewModule,
    VendorCategoryModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
  ],
})
export class AppModule {}
