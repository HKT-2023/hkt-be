import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type VendorCategoryDocument = HydratedDocument<VendorCategory>;

export enum VendorCategoryStatus {
  Active = "Active",
  Inactive = "Inactive",
}

@Schema()
export class VendorCategory extends CreateUpdateSchema {
  @Prop()
  name: string;

  @Prop()
  thumbnail: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop()
  description: string;

  @Prop()
  status: VendorCategoryStatus;
}

export const VendorCategorySchema =
  SchemaFactory.createForClass(VendorCategory);
