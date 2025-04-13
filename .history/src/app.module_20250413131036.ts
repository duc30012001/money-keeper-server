import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { DatabaseConfigService } from './config/database.config';
import { envValidationSchema } from './config/env.validation.schema';

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
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
