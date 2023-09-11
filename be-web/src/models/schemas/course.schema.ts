import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type CourseDocument = HydratedDocument<Course>;

export enum CourseType {
  Video = "video",
  Ebook = "ebook",
}

export enum CourseStatus {
  Draft = "draft",
  Public = "public",
}

export enum UserType {
  User = "User",
  KlaytnAgent = "KlaytnAgent",
}

export class IEmbedLink {
  name: string;
  link: string;
  time?: number;
  page?: number;
}

@Schema()
export class Course extends CreateUpdateSchema {
  @Prop()
  name: string;

  @Prop()
  type: CourseType;

  @Prop()
  userType: UserType;

  @Prop()
  thumbnail: string;

  @Prop({ default: CourseStatus.Draft })
  status: CourseStatus;

  @Prop()
  description: string;

  @Prop()
  token: number;

  @Prop()
  author: string;

  @Prop()
  video: number;

  @Prop()
  page: number;

  @Prop()
  duration: number;

  @Prop({ default: false })
  isRemoved: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
