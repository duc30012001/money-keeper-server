import { applyDecorators } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsDate,
	IsNumber,
	IsOptional,
	IsUUID,
	ValidationOptions,
} from 'class-validator';

function makeSplitter<T>(
	parser: (item: string) => T,
	// sizeOptions: { min?: number; max?: number } = {},
) {
	return Transform(
		({ value }: TransformFnParams): T[] | undefined => {
			if (value == null) return undefined;
			if (typeof value !== 'string') {
				throw new Error(`Value must be a comma-separated string`);
			}
			const parts = value.split(',').map((v) => v.trim());
			return parts.map(parser);
		},
		{ toClassOnly: true },
	);
}

export function CsvUuidArray(validationOpts?: ValidationOptions) {
	return applyDecorators(
		makeSplitter<string>((v) => v),
		IsOptional(),
		IsArray(),
		IsUUID(undefined, { each: true, ...validationOpts }),
	);
}

export function CsvDateRange(validationOpts?: ValidationOptions) {
	return applyDecorators(
		makeSplitter<Date>((v) => {
			const ms = parseInt(v, 10);
			if (isNaN(ms)) throw new Error(`Invalid timestamp: "${v}"`);
			return new Date(ms);
		}),
		IsOptional(),
		IsArray(),
		ArrayMinSize(2),
		ArrayMaxSize(2),
		IsDate({ each: true, ...validationOpts }),
	);
}

export function CsvNumberRange(validationOpts?: ValidationOptions) {
	return applyDecorators(
		makeSplitter<number>((v) => {
			const n = parseFloat(v);
			if (isNaN(n)) throw new Error(`Invalid number: "${v}"`);
			return n;
		}),
		IsOptional(),
		IsArray(),
		ArrayMinSize(2),
		ArrayMaxSize(2),
		IsNumber({}, { each: true, ...validationOpts }),
	);
}
