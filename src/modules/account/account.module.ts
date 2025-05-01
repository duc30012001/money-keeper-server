import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountTypeModule } from '../account-type/account-type.module';
import { AccountController } from './account.controller';
import { Account } from './account.entity';
import { AccountService } from './account.service';

@Module({
	imports: [TypeOrmModule.forFeature([Account]), AccountTypeModule],
	controllers: [AccountController],
	providers: [AccountService],
	exports: [AccountService],
})
export class AccountModule {}
