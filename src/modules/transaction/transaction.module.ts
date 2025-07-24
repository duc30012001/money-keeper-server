import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { TransactionAnalyticService } from './services/transaction-analytic.service';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './transaction.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Transaction]),
		forwardRef(() => AccountModule),
	],
	controllers: [TransactionController],
	providers: [TransactionService, TransactionAnalyticService],
	exports: [TransactionService, TransactionAnalyticService],
})
export class TransactionModule {}
