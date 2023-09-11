import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type QuestionDocument = HydratedDocument<Question>;

export enum QuestionType {
  MULTI = "multi",
  SINGLE = "single",
}

export interface Answer {
  value: string;
  id: string;
}

@Schema()
export class Question extends CreateUpdateSchema {
  @Prop()
  title: string;

  @Prop()
  order: number;

  @Prop()
  answers: [Answer];

  @Prop({ default: QuestionType.SINGLE })
  type: QuestionType;

  @Prop()
  quizId: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
