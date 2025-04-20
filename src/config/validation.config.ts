import { ValidationPipe } from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
	transform: true, // Automatically transform payloads to DTO instances
	whitelist: true, // Strip out properties that are not in the DTO
});
