import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
	APP_PORT: Joi.number().default(3000),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().default(5432),
	DB_USERNAME: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_DATABASE: Joi.string().required(),
	FIREBASE_SERVICE_ACCOUNT_PATH: Joi.string().required(),
	DEFAULT_ADMIN_EMAIL: Joi.string().email().required(),
	DEFAULT_ADMIN_PASSWORD: Joi.string().min(6).required(),
});
