import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
	@Column({ type: 'varchar', length: 255, unique: true })
	email: string;

	@Column({ type: 'varchar', length: 255, select: false })
	@Exclude() // hides it from responses
	password: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({
		type: 'varchar',
		length: 50,
		array: true,
		default: () => "ARRAY['user']",
	})
	roles: string[];
}
