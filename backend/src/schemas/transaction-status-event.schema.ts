import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransactionStatusEventDocument = TransactionStatusEvent & Document;

@Schema({ timestamps: true })
export class TransactionStatusEvent {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true })
  transactionId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  timestamp: Date;
}

export const TransactionStatusEventSchema = SchemaFactory.createForClass(TransactionStatusEvent);
