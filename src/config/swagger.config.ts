import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
	const options = new DocumentBuilder()
		.setTitle('Income and Expense Manager API')
		.setDescription(
			'API documentation for the Income and Expense Manager application',
		)
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup('api-docs', app, document);
}
