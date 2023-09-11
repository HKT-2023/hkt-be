import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type QuizDocument = HydratedDocument<Quiz>;

export interface CorrectAnswer {
  questionId: string;
  answers: number[];
}
@Schema()
export class Quiz extends CreateUpdateSchema {
  @Prop()
  courseId: string;

  @Prop()
  location: number;

  @Prop()
  order: number;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
