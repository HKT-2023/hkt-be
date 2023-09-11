import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/models/schemas/user.schema";
import { UserController } from "src/modules/user/user.controller";
import { UserService } from "src/modules/user/user.service";
import { SendgridLib } from "src/libs/sendgrid.lib";
import {
  UserPoint,
  UserPointSchema,
} from "src/models/schemas/user-point.schema";
import {
  UserAccuracyEstimations,
  UserAccuracyEstimationsSchema,
} from "src/models/schemas/user-accuracy-estimations.schema";
import { TwilioLib } from "src/libs/twilio.lib";
import { Course, CourseSchema } from "src/models/schemas/course.schema";
import { CourseRepository } from "src/models/repositories/course.repository";
import { HttpModule } from "@nestjs/axios";
import { Nft, NftSchema } from "src/models/schemas/nft.schema";
import { NftRepository } from "src/models/repositories/nft.repository";
import {
  UserCourse,
  UserCourseSchema,
} from "src/models/schemas/user-course.schema";
import { UserCourseRepository } from "src/models/repositories/user-course.repository";
import {
  VendorCategory,
  VendorCategorySchema,
} from "src/models/schemas/vendor-category.schema";
import { Review, ReviewSchema } from "src/models/schemas/review.schema";
import { ReviewRepository } from "src/models/repositories/review.repository";
import { Favorite, FavoriteSchema } from "src/models/schemas/favorite.schema";
import { FavoriteRepository } from "src/models/repositories/favorite.repository";
import { NftSellingConfig, NftSellingConfigSchema } from "src/models/schemas/nft-selling-configs.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserPoint.name, schema: UserPointSchema },
      {
        name: UserAccuracyEstimations.name,
        schema: UserAccuracyEstimationsSchema,
      },
      {
        name: Course.name,
        schema: CourseSchema,
      },
      {
        name: UserCourse.name,
        schema: UserCourseSchema,
      },
      {
        name: Nft.name,
        schema: NftSchema,
      },
      {
        name: VendorCategory.name,
        schema: VendorCategorySchema,
      },
      {
        name: Review.name,
        schema: ReviewSchema,
      },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: NftSellingConfig.name, schema: NftSellingConfigSchema },
    ]),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    SendgridLib,
    TwilioLib,
    CourseRepository,
    UserCourseRepository,
    NftRepository,
    ReviewRepository,
    FavoriteRepository,
  ],
})
export class UserModule {}
