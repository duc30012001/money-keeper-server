import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
