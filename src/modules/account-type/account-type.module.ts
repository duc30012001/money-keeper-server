import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountTypeController } from './account-type.controller';
import { AccountType } from './account-type.entity';
import { AccountTypeService } from './account-type.service';

@Module({
	imports: [TypeOrmModule.forFeature([AccountType])],
	controllers: [AccountTypeController],
	providers: [AccountTypeService],
	exports: [AccountTypeService],
})
export class AccountTypeModule {}
