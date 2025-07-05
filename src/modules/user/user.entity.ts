import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { UserRole } from './user.enum';

@Entity({ name: 'users' })
export class User extends BaseEntity {
	@Column({ type: 'varchar', length: 255, unique: true })
	email: string;

	@Column({ type: 'varchar', length: 255 })
	@Exclude() // hides it from responses
	password: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;
}
