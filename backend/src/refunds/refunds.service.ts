import { Injectable, BadRequestException, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Refund, RefundDocument, RefundStatus } from '../schemas/refund.schema';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionStatus } from '../schemas/transaction.schema';

@Injectable()
export class RefundsService {
  constructor(
    @InjectModel(Refund.name) private refundModel: Model<RefundDocument>,
    private transactionsService: TransactionsService,
  ) {}

  async create(merchantId: string, transactionId: string, reason: string) {
    const { transaction } = await this.transactionsService.findOne(merchantId, transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.REFUNDED) {
      throw new BadRequestException('Transaction is already refunded');
    }
    
    if (transaction.status !== TransactionStatus.SUCCESSFUL) {
      throw new BadRequestException('Only successful transactions can be refunded');
    }

    const transactionDate = new Date(transaction.date);
    const differenceInDays = (new Date().getTime() - transactionDate.getTime()) / (1000 * 3600 * 24);

    if (differenceInDays > 30) {
      throw new NotAcceptableException('Transaction is older than 30 days, cannot be refunded');
    }

    // Creating Refund Event
    const refund = new this.refundModel({
      transactionId: transaction._id,
      amount: transaction.amount,
      reason,
      date: new Date(),
      status: RefundStatus.PROCESSED,
    });
    
    await refund.save();

    await this.transactionsService.updateStatus(transactionId, TransactionStatus.REFUNDED);

    return refund;
  }
}
