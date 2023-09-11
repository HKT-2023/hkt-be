import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";
import { TypeOfUser } from "src/modules/user/user.const";

export type UserDocument = HydratedDocument<User>;

export enum UserTag {
  Buyer = "buyer",
  Seller = "seller",
  BuyerAndSeller = "buyer_and_seller",
}

@Schema()
export class User extends CreateUpdateSchema {
  @Prop()
  avatarUrl: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  typeOfUser: TypeOfUser;

  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  dateOfBirth: string;

  @Prop()
  status: UserStatus;

  @Prop()
  action: string;

  @Prop()
  agentName: string;

  @Prop()
  license: string;

  @Prop()
  agentEmail: string;

  @Prop()
  businessName: string;

  @Prop({ unique: true })
  listAgentMlsId: string;

  @Prop()
  vendorEmail: string;

  @Prop()
  vendorLocation: string;

  @Prop()
  vendorType: string[];

  @Prop()
  code: string;

  @Prop()
  invalidCodeTime: number;

  @Prop()
  expireCode: number;

  @Prop()
  socialMedia: string[];

  @Prop()
  description: string;

  @Prop()
  primaryContact: string;

  @Prop()
  commission: number;

  @Prop()
  source: UserSource;

  @Prop({
    default(): UserTag {
      return UserTag.BuyerAndSeller;
    },
  })
  userTag: UserTag;
}

export enum UserSource {
  CreatedByAdmin = "created-by-admin",
}

export const UserSchema = SchemaFactory.createForClass(User);

export enum UserStatus {
  Active = "Active",
  InActive = "Inactive",
}
