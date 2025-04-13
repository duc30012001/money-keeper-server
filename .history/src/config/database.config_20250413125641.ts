import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) {}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		return {
			type: 'postgres', // Type of database
			host: this.configService.get<string>('DB_HOST'),
			port: this.configService.get<number>('DB_PORT') || 5432,
			username: this.configService.get<string>('DB_USERNAME'),
			password: this.configService.get<string>('DB_PASSWORD'),
			database: this.configService.get<string>('DB_DATABASE'),
			entities: [__dirname + '/../**/*.entity{.ts,.js}'],
			synchronize: true, // Note: set to false in production
		};
	}
}
