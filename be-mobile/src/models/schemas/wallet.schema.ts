import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateUpdateSchema } from "src/models/schemas/create-update.schema";

export type WalletDocument = HydratedDocument<Wallet>;

@Schema()
export class Wallet extends CreateUpdateSchema {
  @Prop()
  userId: string;

  @Prop()
  accountId: string;

  @Prop()
  address: string;

  @Prop()
  nodeId: string;

  @Prop()
  createdTxId: string;

  @Prop()
  createdTxHash: string;

  @Prop()
  privateKey: string;

  @Prop()
  publicKey: string;

  @Prop()
  point: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
