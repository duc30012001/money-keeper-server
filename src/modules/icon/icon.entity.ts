import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('icons')
export class Icon extends BaseEntity {
	@Column({ name: 'name' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column({ name: 'url' })
	@IsString()
	url: string;

	@Column({ name: 'type', default: 'common' })
	@IsString()
	type: string;
}
