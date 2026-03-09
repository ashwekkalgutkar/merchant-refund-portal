import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Merchant } from './schemas/merchant.schema';
import { Transaction, TransactionStatus } from './schemas/transaction.schema';
import { faker } from '@faker-js/faker';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const merchantModel = app.get<Model<Merchant>>(getModelToken(Merchant.name));
  const transactionModel = app.get<Model<Transaction>>(getModelToken(Transaction.name));

  await merchantModel.deleteMany({});
  await transactionModel.deleteMany({});

  console.log('Clearing DB...');

  const passwordHash = await bcrypt.hash('password123', 10);
  
  const merchants = await merchantModel.insertMany([
    { name: 'Acme Corp', email: 'admin@acmecorp.com', passwordHash },
    { name: 'Globex', email: 'admin@globex.com', passwordHash }
  ]);
  
  console.log('Merchants seeded!');

  const transactions: any[] = [];
  
  for (const merchant of merchants) {
    for (let i = 0; i < 50; i++) {
        const date = faker.date.recent({ days: 60 });
        transactions.push({
            merchantId: merchant._id,
            amount: parseFloat(faker.finance.amount({ min: 10, max: 1000, dec: 2 })),
            date,
            status: faker.helpers.arrayElement([TransactionStatus.SUCCESSFUL, TransactionStatus.FAILED, TransactionStatus.PENDING, TransactionStatus.REFUNDED]),
            customerName: faker.person.fullName(),
        });
    }
  }

  await transactionModel.insertMany(transactions);
  console.log('Transactions seeded!');

  await app.close();
}
bootstrap();
