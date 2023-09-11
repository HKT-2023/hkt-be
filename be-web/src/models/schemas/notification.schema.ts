import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification extends CreateUpdateSchema {
  @Prop()
  type: string;

  @Prop()
  message: string;

  @Prop()
  listingId: string;

  @Prop()
  userId: string;

  @Prop({
    default: false
  })
  read: boolean
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export enum NotificationType {
  ContactAgent = "contact",
  RequestTour = "request",
}
