import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { DatabaseConfigService } from './config/database.config';
import { envValidationSchema } from './config/env.validation.schema';
import { AccountTypeModule } from './modules/account-type/account-type.module';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { BudgetModule } from './modules/budget/budget.module';
import { CategoryModule } from './modules/category/category.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { IconModule } from './modules/icon/icon.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { InitModule } from './modules/init/init.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UserModule } from './modules/user/user.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig],
			validationSchema: envValidationSchema,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useClass: DatabaseConfigService,
		}),
		// ... other modules
		UserModule,
		AuthModule,
		BudgetModule,
		FirebaseModule,
		InitModule,
		AccountTypeModule,
		CategoryModule,
		AccountModule,
		TransactionModule,
		IconModule,
		ImportExportModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
