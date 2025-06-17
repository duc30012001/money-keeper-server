import { Expose, Type } from 'class-transformer';
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	Tree,
	TreeChildren,
	TreeParent,
} from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Icon } from '../icon/icon.entity';
import { Transaction } from '../transaction/transaction.entity';
import { CategoryType } from './category.enum';

@Entity('categories')
@Tree('closure-table')
export class Category extends BaseEntity {
	@Column({ name: 'name', unique: true })
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column({
		type: 'enum',
		enum: CategoryType,
		name: 'type',
	})
	@IsEnum(CategoryType)
	type: CategoryType;

	@Column({ name: 'description', nullable: true })
	@IsOptional()
	@IsString()
	description?: string;

	@Column({ name: 'sort_order', type: 'int', default: 1 })
	@IsNumber()
	sortOrder: number;

	@TreeParent({ onDelete: 'CASCADE' })
	@JoinColumn({ name: 'parent_id' })
	@Expose()
	@Type(() => Category)
	parent: Category | null;

	@TreeChildren({ cascade: true })
	@Expose()
	@Type(() => Category)
	children: Category[];

	@OneToMany(() => Transaction, (transaction) => transaction.category)
	transaction: Transaction[];

	@ManyToOne(() => Icon)
	@JoinColumn({ name: 'icon_id' })
	icon: Icon;
}
