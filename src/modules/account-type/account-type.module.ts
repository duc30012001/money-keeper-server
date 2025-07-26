import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IconModule } from '../icon/icon.module';
import { AccountTypeController } from './account-type.controller';
import { AccountType } from './account-type.entity';
import { AccountTypeService } from './account-type.service';

@Module({
	imports: [TypeOrmModule.forFeature([AccountType]), IconModule],
	controllers: [AccountTypeController],
	providers: [AccountTypeService],
	exports: [AccountTypeService],
})
export class AccountTypeModule {}
