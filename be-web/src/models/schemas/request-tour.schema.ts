import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type RequestTourDocument = HydratedDocument<RequestTour>;

@Schema()
export class RequestTour extends CreateUpdateSchema {
  @Prop()
  userId: string;

  @Prop()
  day: string;

  @Prop()
  timeFrame: string;

  @Prop()
  listingId: string;
}

export const RequestTourSchema = SchemaFactory.createForClass(RequestTour);
