// Define an interface for our configuration
export interface AppConfig {
	app: {
		port: number;
	};
	database: {
		host: string;
		port: number;
		username: string;
		password: string;
		database: string;
	};
	auth: {
		accessTokenSecret: string;
		accessTokenExpiresIn: string;
		refreshTokenSecret: string;
		refreshTokenExpiresIn: string;
	};
}

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
		database: process.env.DB_DATABASE || 'mydatabase',
	},
	auth: {
		// For Access Token
		accessTokenSecret:
			process.env.JWT_ACCESS_TOKEN_SECRET || 'accessSecret',
		accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h',
		// For Refresh Token
		refreshTokenSecret:
			process.env.JWT_REFRESH_TOKEN_SECRET || 'refreshSecret',
		refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
	},
});
