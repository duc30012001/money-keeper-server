import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from '../account/account.entity';
import { Category } from '../category/category.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';

@Module({
	imports: [TypeOrmModule.forFeature([Account, Category]), TransactionModule],
	controllers: [ImportExportController],
	providers: [ImportExportService],
	exports: [ImportExportService],
})
export class ImportExportModule {}
