import { AppConfig } from 'src/common/types/config.interface';

export default (): AppConfig => ({
	app: {
		port: parseInt(process.env.APP_PORT ?? '3000', 10),
	},
	database: {
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT ?? '5432', 10),
		username: process.env.DB_USERNAME || 'postgres',
		password: process.env.DB_PASSWORD || 'password',
		database: process.env.DB_DATABASE || 'database',
	},
	firebase: {
		serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
	},
});
