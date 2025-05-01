import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { DatabaseConfigService } from './config/database.config';
import { envValidationSchema } from './config/env.validation.schema';
import { AccountTypeModule } from './modules/account-type/account-type.module';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { InitModule } from './modules/init/init.module';
import { KeysModule } from './modules/keys/keys.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UserModule } from './modules/user/user.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig],
			validationSchema: envValidationSchema,
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService): JwtModuleOptions => ({
				secret:
					configService.get<string>('jwt.privateKey') ||
					'defaultPrivateKey',
				signOptions: {
					// Provide a default value and cast the result as Algorithm
					algorithm: (configService.get<string>('jwt.algorithm') ||
						'RS256') as jwt.Algorithm,
					expiresIn:
						configService.get<string>('jwt.accessTokenExpiresIn') ||
						'1h',
				},
			}),
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useClass: DatabaseConfigService,
		}),
		// ... other modules
		UserModule,
		AuthModule,
		KeysModule,
		InitModule,
		AccountTypeModule,
		CategoryModule,
		AccountModule,
		TransactionModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
