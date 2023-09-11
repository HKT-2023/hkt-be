import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CourseType } from "src/models/schemas/course.schema";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type UserCourseDocument = HydratedDocument<UserCourse>;

export enum CourseProgressStatus {
  New = "new",
  Continue = "continue",
  Done = "done",
}

export enum ClaimTokenStatus {
  Doing = "doing",
  Completed = "completed",
}

@Schema()
export class UserCourse extends CreateUpdateSchema {
  @Prop()
  userId: string;

  @Prop()
  courseId: string;

  @Prop()
  totalVideo: number;

  @Prop()
  totalTime: number;

  @Prop()
  totalPage: number;

  @Prop()
  progressStatus: CourseProgressStatus;

  @Prop({ default: 0 })
  percent: number;

  @Prop()
  type: CourseType;

  @Prop({ default: ClaimTokenStatus.Doing })
  claimTokenStatus: ClaimTokenStatus;
}

export const UserCourseSchema = SchemaFactory.createForClass(UserCourse);
