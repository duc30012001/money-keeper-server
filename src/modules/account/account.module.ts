import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountTypeModule } from '../account-type/account-type.module';
import { IconModule } from '../icon/icon.module';
import { TransactionModule } from '../transaction/transaction.module';
import { AccountController } from './account.controller';
import { Account } from './account.entity';
import { AccountBalanceService } from './services/account-balance.service';
import { AccountService } from './services/account.service';
@Module({
	imports: [
		TypeOrmModule.forFeature([Account]),
		AccountTypeModule,
		IconModule,
		forwardRef(() => TransactionModule),
	],
	controllers: [AccountController],
	providers: [AccountService, AccountBalanceService],
	exports: [AccountService, AccountBalanceService],
})
export class AccountModule {}
