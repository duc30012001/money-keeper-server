import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transaction/transaction.entity';
import { BudgetController } from './budget.controller';
import { Budget } from './budget.entity';
import { BudgetService } from './budget.service';

@Module({
	imports: [TypeOrmModule.forFeature([Budget, Transaction])],
	controllers: [BudgetController],
	providers: [BudgetService],
	exports: [BudgetService],
})
export class BudgetModule {}
