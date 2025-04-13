import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { DatabaseConfigService } from './config/database.config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig],
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
