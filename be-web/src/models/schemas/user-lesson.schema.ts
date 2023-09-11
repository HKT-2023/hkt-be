import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type UserLessonDocument = HydratedDocument<UserLesson>;

export enum UserLessonType {
  Processing = "processing",
  Done = "done",
}

@Schema()
export class UserLesson extends CreateUpdateSchema {
  @Prop()
  userId: string;

  @Prop()
  courseId: string;

  @Prop()
  lessonId: string;

  @Prop()
  status: UserLessonType;

  @Prop({ require: false })
  currentTime: number;

  @Prop({ require: false })
  currentPage: number;
}

export const UserLessonSchema = SchemaFactory.createForClass(UserLesson);
