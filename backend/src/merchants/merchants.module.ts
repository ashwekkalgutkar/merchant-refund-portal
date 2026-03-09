import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MerchantsService } from './merchants.service';
import { Merchant, MerchantSchema } from '../schemas/merchant.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Merchant.name, schema: MerchantSchema }])],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
