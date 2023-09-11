import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";
import { TypeOfUser } from "src/modules/user/user.const";

export type UserDocument = HydratedDocument<User>;

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

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  phoneVerify: string;

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
  companyName: string;

  @Prop()
  agentEmail: string;

  @Prop()
  businessName: string;

  @Prop({ unique: true })
  listAgentMlsId : string;

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
  invalidPhoneCodeTime: number;

  @Prop()
  blockPhoneTime: number;

  @Prop()
  expireCode: number;

  @Prop()
  socialMedia: string[];

  @Prop()
  description: string;

  @Prop()
  primaryContact: string;

  @Prop()
  source: UserSource;

  @Prop()
  externalUserId: string;

  @Prop()
  commission: string;

  @Prop({ default: false })
  isVerifyPhone: boolean;

  @Prop()
  phoneCode: string;

  @Prop()
  expirePhoneCode: number;
}

export enum UserSource {
  CreatedByAdmin = "created-by-admin",
  Google = "google",
  Apple = "apple",
}

export const UserSchema = SchemaFactory.createForClass(User);

export enum UserStatus {
  Active = "Active",
  InActive = "Inactive",
}

export enum VendorType {
  Photography = "Photography",
  Videography = "Videography",
  FurnitureStaging = "FurnitureStaging",
  Plumbing = "Plumbing",
  Painting = "Painting",
  Escrow = "Escrow",
  Title = "Title",
  Termite = "Termite",
  HomeInspection = "HomeInspection",
}
