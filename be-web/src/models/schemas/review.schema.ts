import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type ReviewDocument = HydratedDocument<Review>;

export enum ReviewStatus {
  Hidden = "Hidden",
  Displayed = "Displayed",
}

@Schema()
export class Review extends CreateUpdateSchema {
  @Prop()
  userId: string;

  @Prop()
  vendorId: string;

  @Prop()
  userName: string;

  @Prop()
  vendorName: string;

  @Prop()
  vendorCateId: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop()
  comment: string;

  @Prop()
  status: ReviewStatus;

  // review Id
  @Prop()
  parentId: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
