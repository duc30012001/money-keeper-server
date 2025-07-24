import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IconModule } from '../icon/icon.module';
import { TransactionModule } from '../transaction/transaction.module';
import { CategoryController } from './category.controller';
import { Category } from './category.entity';
import { CategoryAnalyticService } from './services/category-analytic.service';
import { CategoryService } from './services/category.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Category]),
		IconModule,
		TransactionModule,
	],
	controllers: [CategoryController],
	providers: [CategoryService, CategoryAnalyticService],
	exports: [CategoryService, CategoryAnalyticService],
})
export class CategoryModule {}
