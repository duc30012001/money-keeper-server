import { AppConfig } from 'src/common/types/config.interface';
import jwtConfig from './jwt.config';

// Define an interface for our configuration

// Export a default function that returns the configuration object.
// This function reads values from the environment variables.
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
	jwt: jwtConfig().jwt,
});
