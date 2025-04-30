import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateSortOrderDto {
	@ApiProperty({
		description: 'Array of category IDs in the desired order',
		example: [
			'550e8400-e29b-41d4-a716-446655440000',
			'550e8400-e29b-41d4-a716-446655440001',
		],
		type: [String],
	})
	@IsArray()
	@IsNotEmpty()
	@IsString({ each: true })
	@IsUUID('4', { each: true })
	ids: string[];
}
