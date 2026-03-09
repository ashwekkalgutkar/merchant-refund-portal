import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { Refund, RefundSchema } from '../schemas/refund.schema';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Refund.name, schema: RefundSchema }]),
    TransactionsModule
  ],
  providers: [RefundsService],
  controllers: [RefundsController],
})
export class RefundsModule {}
