import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListUserDto } from '../user/dtos/get-user.dto';
import { UserRole } from '../user/user.enum';
import { UserService } from '../user/user.service';

@Injectable()
export class InitService implements OnModuleInit {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
	) {}

	async onModuleInit() {
		await this.createDefaultUser();
	}

	private async createDefaultUser() {
		try {
			// Check if any users exist
			const query: ListUserDto = {
				page: 1,
				pageSize: 1,
				skip: 0,
				limit: 1,
			};
			const users = await this.userService.getList(query);

			if (users.meta.total === 0) {
				// Create default admin user
				const defaultEmail = this.configService.get<string>(
					'DEFAULT_ADMIN_EMAIL',
				);
				const defaultPassword = this.configService.get<string>(
					'DEFAULT_ADMIN_PASSWORD',
				);

				if (defaultEmail && defaultPassword) {
					await this.userService.create({
						email: defaultEmail,
						password: defaultPassword,
						role: UserRole.ADMIN,
						isActive: true,
					});

					console.log('Default admin user created successfully');
				}
			}
		} catch (error) {
			console.error('Error creating default user:', error);
		}
	}
}
