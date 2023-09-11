import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/models/schemas/user.schema";
import { UserController } from "src/modules/user/user.controller";
import { UserService } from "src/modules/user/user.service";
import { SendgridLib } from "src/libs/sendgrid.lib";
import {
  VendorCategory,
  VendorCategorySchema,
} from "src/models/schemas/vendor-category.schema";
import { VendorCategoryRepository } from "src/models/repositories/vendor-category.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VendorCategory.name, schema: VendorCategorySchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, SendgridLib, VendorCategoryRepository],
})
export class UserModule {}
