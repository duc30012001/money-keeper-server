import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Locale } from 'src/common/enums/common';

export class FirebaseSigninDto {
	@ApiProperty({
		description: 'Firebase ID token from client',
		example: 'eyJhbGciOiJSUzI1NiIs...',
	})
	@IsString()
	idToken: string;

	@ApiPropertyOptional({
		description: 'Locale for initial data',
		example: 'en',
	})
	@IsOptional()
	@IsEnum(Locale)
	locale?: Locale;
}
