import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type UserVendorCategoryDocument = HydratedDocument<UserVendorCategory>;

@Schema()
export class UserVendorCategory extends CreateUpdateSchema {
  @Prop()
  userId: string;

  @Prop()
  vendorCategoryId: string;
}

export const UserVendorCategorySchema =
  SchemaFactory.createForClass(UserVendorCategory);
