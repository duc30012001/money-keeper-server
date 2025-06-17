import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { IconType } from './enums/icon-type.enum';

@Entity('icons')
export class Icon extends BaseEntity {
	@Column({ name: 'name' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column({ name: 'url' })
	@IsString()
	url: string;

	@Column({ name: 'type', enum: IconType, default: IconType.COMMON })
	@IsEnum(IconType)
	type: IconType;
}
