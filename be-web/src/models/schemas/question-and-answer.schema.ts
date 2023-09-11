import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type QuestionAndAnswerDocument = HydratedDocument<QuestionAndAnswer>;

@Schema()
export class QuestionAndAnswer extends CreateUpdateSchema {
  @Prop()
  question: string;

  @Prop()
  answer: string;
}

export const QuestionAndAnswerSchema =
  SchemaFactory.createForClass(QuestionAndAnswer);
