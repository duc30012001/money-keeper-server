import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsDate,
	IsEnum,
	IsNumber,
	IsOptional,
	IsUUID,
} from 'class-validator';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';
import { OrderDirection } from 'src/common/enums/common';
import { TransactionOrderBy } from '../transaction.enum';

export class FindTransactionDto extends BaseQueryDto {
	@ApiPropertyOptional({
		description: 'Account type IDs to filter accounts (comma-separated)',
		example: '1,2,3',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }: { value: string | string[] }) => {
		if (typeof value === 'string') {
			return value.split(',').map((type) => type.trim());
		}
		return value;
	})
	@IsArray()
	@IsUUID(undefined, { each: true })
	accountIds?: string[];

	@ApiPropertyOptional({
		description: 'Category IDs to filter categories (comma-separated)',
		example: '1,2,3',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }: { value: string | string[] }) => {
		if (typeof value === 'string') {
			return value.split(',').map((type) => type.trim());
		}
		return value;
	})
	@IsArray()
	@IsUUID(undefined, { each: true })
	categoryIds?: string[];

	@ApiPropertyOptional({
		description:
			'Transaction date range as two UNIX‐ms timestamps, comma-separated (e.g. ?transactionDate=1746032400000,1748019600000)',
		example: '1746032400000,1748019600000',
	})
	@IsOptional()
	@Transform(
		({ value }: TransformFnParams): Date[] | undefined => {
			// if not provided, keep it undefined
			if (value == null) return undefined;

			if (typeof value !== 'string') {
				throw new Error(
					'transactionDate must be a comma-separated string',
				);
			}

			const parts = value.split(',');
			if (parts.length !== 2) {
				throw new Error(
					'transactionDate must contain exactly two comma-separated values',
				);
			}

			const result = parts.map((v) => {
				const n = parseInt(v, 10);
				if (isNaN(n)) {
					throw new Error(`Invalid timestamp: "${v}"`);
				}
				return new Date(n);
			});

			return result;
		},
		{ toClassOnly: true },
	)
	@IsArray()
	@ArrayMinSize(2)
	@ArrayMaxSize(2)
	@IsDate({ each: true })
	transactionDate?: Date[];

	@ApiPropertyOptional({
		description:
			'Amount range as two numbers, comma-separated (e.g. ?amount=100000,500000)',
		example: '100000,500000',
	})
	@IsOptional()
	@Transform(
		({ value }: TransformFnParams): number[] | undefined => {
			if (value == null) return undefined;

			if (typeof value !== 'string') {
				throw new Error('amount must be a comma-separated string');
			}

			const parts = value.split(',');
			if (parts.length !== 2) {
				throw new Error(
					'amount must contain exactly two comma-separated values',
				);
			}

			const result = parts.map((v) => {
				const n = parseFloat(v);
				if (isNaN(n)) {
					throw new Error(`Invalid amount: "${v}"`);
				}
				return n;
			});

			return result;
		},
		{ toClassOnly: true },
	)
	@IsArray()
	@ArrayMinSize(2)
	@ArrayMaxSize(2)
	@IsNumber({}, { each: true })
	amount?: number[];

	@ApiPropertyOptional({
		description: 'Order by',
		enum: TransactionOrderBy,
	})
	@IsOptional()
	@IsEnum(TransactionOrderBy)
	orderBy?: TransactionOrderBy;

	@ApiPropertyOptional({
		description: 'Order direction',
		enum: OrderDirection,
	})
	@IsOptional()
	@IsEnum(OrderDirection)
	orderDirection?: OrderDirection;
}
