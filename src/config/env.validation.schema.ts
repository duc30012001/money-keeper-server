import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
	APP_PORT: Joi.number().default(3000),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().default(5432),
	DB_USERNAME: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_DATABASE: Joi.string().required(),
	JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
	JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('1h'),
	JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
	JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),
});
