import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';
import { TransactionStatusEvent, TransactionStatusEventDocument } from '../schemas/transaction-status-event.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(TransactionStatusEvent.name) private eventModel: Model<TransactionStatusEventDocument>,
  ) {}

  async findAll(merchantId: string, query: any) {
    const { page = 1, limit = 10, status, search, dateFrom, dateTo } = query;
    const filter: any = { merchantId };

    if (status) filter.status = status;
    if (search) filter._id = search; // simple search by exact ID
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const total = await this.transactionModel.countDocuments(filter);
    const transactions = await this.transactionModel
      .find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    return {
      data: transactions,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(merchantId: string, id: string) {
    const transaction = await this.transactionModel.findOne({ _id: id, merchantId }).exec();
    if (!transaction) throw new NotFoundException('Transaction not found');
    
    const events = await this.eventModel.find({ transactionId: id }).sort({ timestamp: 1 }).exec();
    
    return { transaction, events };
  }

  async updateStatus(id: string, status: string) {
    const transaction = await this.transactionModel.findByIdAndUpdate(id, { status }, { new: true });
    if (transaction) {
      await this.eventModel.create({
        transactionId: id,
        status,
        timestamp: new Date()
      });
    }
    return transaction;
  }
}
