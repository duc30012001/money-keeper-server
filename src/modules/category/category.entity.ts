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
	Tree,
	TreeChildren,
	TreeParent,
} from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { ActionType } from './enums/action-type.enum';

@Entity('categories')
@Tree('closure-table')
export class Category extends BaseEntity {
	@Column({ name: 'name', unique: true })
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column({ name: 'icon', nullable: true })
	@IsOptional()
	@IsString()
	icon?: string;

	@Column({
		type: 'enum',
		enum: ActionType,
		name: 'action_type',
	})
	@IsEnum(ActionType)
	actionType: ActionType;

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
	parent?: Category;

	@TreeChildren({ cascade: true })
	@Expose()
	@Type(() => Category)
	children: Category[];

	@Expose()
	get depth(): number {
		if (!this.parent) return 0;
		return this.parent.depth + 1;
	}
}
