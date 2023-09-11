import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type ReportListingDocument = HydratedDocument<ReportListing>;

export enum ReportedListingStatus {
  Active = "Active",
  InActive = "Inactive",
}

@Schema()
export class ReportListing extends CreateUpdateSchema {
  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  location: string;

  @Prop()
  listingId: string;

  @Prop({ default: ReportedListingStatus.Active })
  reportListingStatus: ReportedListingStatus;

  @Prop()
  reason: string;
}

export const ReportListingSchema = SchemaFactory.createForClass(ReportListing);
