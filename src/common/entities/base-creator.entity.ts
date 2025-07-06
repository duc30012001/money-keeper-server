import { User } from 'src/modules/user/user.entity';
import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class BaseCreatorEntity extends BaseEntity {
	@Column()
	creatorId: string;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'creator_id' })
	creator: User;
}
