import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Merchant, MerchantDocument } from '../schemas/merchant.schema';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
  ) {}

  async findByEmail(email: string): Promise<MerchantDocument | null> {
    return this.merchantModel.findOne({ email }).exec();
  }
}
