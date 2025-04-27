import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@ApiProperty({
		description: 'User email',
		example: 'user@example.com',
		required: false,
	})
	email?: string;

	@ApiProperty({
		description: 'User password (min 6 characters)',
		example: 'password123',
		minLength: 6,
		required: false,
	})
	password?: string;

	@ApiProperty({
		description: 'Whether the user is active',
		example: true,
		required: false,
	})
	isActive?: boolean;

	@ApiProperty({
		description: 'User roles',
		example: ['user', 'admin'],
		required: false,
		type: [String],
	})
	roles?: string[];
}
