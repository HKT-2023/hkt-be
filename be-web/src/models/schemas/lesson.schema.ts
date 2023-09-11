import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type LessonDocument = HydratedDocument<Lesson>;

@Schema()
export class Lesson extends CreateUpdateSchema {
  @Prop()
  courseId: string;

  @Prop()
  name: string;

  @Prop()
  link: string;

  @Prop()
  thumbnail: string;

  @Prop()
  time?: number;

  @Prop()
  page?: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
