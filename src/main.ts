import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { corsConfig } from './config/cors.config';
import { setupSwagger } from './config/swagger.config';
import { globalValidationPipe } from './config/validation.config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Set up global validation pipe with class-transformer options
	app.useGlobalPipes(globalValidationPipe);
	app.useGlobalInterceptors(new ResponseInterceptor());

	// Apply JwtAuthGuard to all controllers by default
	app.useGlobalGuards(app.get(JwtAuthGuard));

	// Set up Swagger documentation
	setupSwagger(app);

	app.enableCors(corsConfig());

	const port = process.env.APP_PORT || 3000;
	await app.listen(port);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
