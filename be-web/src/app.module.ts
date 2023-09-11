import { ConsoleModule } from "nestjs-console";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DATABASE_CONFIG as db } from "src/configs/database.config";
import { AuthModule } from "src/modules/authentication/auth.module";
import { UserModule } from "src/modules/user/user.module";
import { JwtAuthGuard } from "src/modules/authentication/jwt-auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { JwtStrategy } from "src/modules/authentication/jwt.strategy";
import { FileModule } from "src/modules/file/file.module";
import { QuestionAndAnswerModule } from "src/modules/question-and-answer/question-and-answer.module";
import { ListingModule } from "./modules/listing/listing.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { ReportListingModule } from "src/modules/report-listing/report-listing.module";
import { QuestionModule } from "src/modules/question/question.module";
import { QuizModule } from "src/modules/quiz/quiz.module";
import { CourseModule } from "src/modules/course/course.module";
import { LessonModule } from "src/modules/lesson/lesson.module";
import { VendorCategoryModule } from "src/modules/vendor-category/vendor-category.module";
import { ReviewModule } from "src/modules/review/review.module";

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${db.userName}:${db.password}@${db.host}:${db.port}/${db.databaseName}?authSource=${db.databaseName}`
    ),
    ConsoleModule,
    AuthModule,
    UserModule,
    FileModule,
    QuestionAndAnswerModule,
    ListingModule,
    NotificationModule,
    ReportListingModule,
    CourseModule,
    QuizModule,
    QuestionModule,
    LessonModule,
    VendorCategoryModule,
    ReviewModule,
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
