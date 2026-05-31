import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { UserRole } from './user.enum';

@Entity({ name: 'users' })
export class User extends BaseEntity {
	@Column({ type: 'varchar', length: 255, unique: true })
	email: string;

	@Column({ type: 'varchar', length: 128, unique: true, nullable: true })
	firebaseUid: string | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	displayName: string | null;

	@Column({ type: 'text', nullable: true })
	photoUrl: string | null;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;
}
