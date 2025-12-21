import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class BulkDeleteTransactionDto {
	@ApiProperty({
		description: 'Array of transaction IDs to delete',
		example: [
			'123e4567-e89b-12d3-a456-426614174000',
			'123e4567-e89b-12d3-a456-426614174001',
		],
	})
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID('4', { each: true })
	ids: string[];
}

export class BulkDeleteResultDto {
	@ApiProperty({ description: 'Number of successfully deleted transactions' })
	success: number;

	@ApiProperty({ description: 'Number of failed deletions' })
	failed: number;

	@ApiProperty({ description: 'Error details for failed deletions' })
	errors: { id: string; message: string }[];
}
