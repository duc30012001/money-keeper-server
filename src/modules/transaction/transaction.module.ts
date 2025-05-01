import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { TransactionController } from './transaction.controller';
import { Transaction } from './transaction.entity';
import { TransactionService } from './transaction.service';

@Module({
	imports: [TypeOrmModule.forFeature([Transaction]), AccountModule],
	controllers: [TransactionController],
	providers: [TransactionService],
	exports: [TransactionService],
})
export class TransactionModule {}
