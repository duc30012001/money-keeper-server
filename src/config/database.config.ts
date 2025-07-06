import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) {}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		return {
			type: 'postgres',
			host: this.configService.get<string>('DB_HOST'),
			port: this.configService.get<number>('DB_PORT') || 5432,
			username: this.configService.get<string>('DB_USERNAME'),
			password: this.configService.get<string>('DB_PASSWORD'),
			database: this.configService.get<string>('DB_DATABASE'),

			// Entities
			entities: [__dirname + '/../**/*.entity{.ts,.js}'],
			autoLoadEntities: true,

			// Naming strategy
			namingStrategy: new SnakeNamingStrategy(),

			// Tắt synchronize, dùng migration
			// synchronize: true,
			synchronize: false,
			migrations: ['src/migrations/*{.ts,.js}'],
		};
	}
}
