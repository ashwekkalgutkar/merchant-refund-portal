import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export enum TransactionStatus {
  SUCCESSFUL = 'Successful',
  FAILED = 'Failed',
  PENDING = 'Pending',
  REFUNDED = 'Refunded',
}

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true })
  merchantId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: string;

  @Prop({ required: true })
  customerName: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
