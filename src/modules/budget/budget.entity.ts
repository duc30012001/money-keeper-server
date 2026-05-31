import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseCreatorEntity } from 'src/common/entities/base-creator.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Category } from '../category/category.entity';
import { BudgetPeriod } from './budget.enum';

@Entity('budgets')
@Unique(['creatorId', 'period', 'category'])
export class Budget extends BaseCreatorEntity {
	@Column({ type: 'varchar', length: 255 })
	@IsString()
	name: string;

	@Column({ type: 'enum', enum: BudgetPeriod })
	@IsEnum(BudgetPeriod)
	period: BudgetPeriod;

	@Column({ type: 'decimal', precision: 18, scale: 2 })
	@IsNumber()
	amount: number;

	@ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'category_id' })
	category: Category | null;

	@Column({ type: 'text', nullable: true })
	@IsOptional()
	@IsString()
	description: string | null;
}
