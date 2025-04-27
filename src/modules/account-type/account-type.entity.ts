import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, Entity, Unique } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('account_types')
@Unique(['name'])
export class AccountType extends BaseEntity {
	@Column({ name: 'name', unique: true })
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column({ name: 'description', nullable: true })
	@IsOptional()
	@IsString()
	description?: string;

	@Column({ name: 'sort_order', type: 'int', default: 1 })
	@IsNumber()
	sortOrder: number;
}
