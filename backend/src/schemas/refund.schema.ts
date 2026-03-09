import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export enum RefundStatus {
  PENDING = 'Pending',
  PROCESSED = 'Processed',
  REJECTED = 'Rejected',
}

export type RefundDocument = Refund & Document;

@Schema({ timestamps: true })
export class Refund {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true })
  transactionId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, enum: RefundStatus, default: RefundStatus.PENDING })
  status: string;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);
