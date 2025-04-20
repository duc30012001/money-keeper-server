export interface JwtConfig {
	algorithm: string;
	privateKey: string;
	publicKey: string;
	accessTokenExpiresIn: string;
	refreshTokenExpiresIn: string;
	jwksUri: string;
	kid: string;
}

export interface DatabaseConfig {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
}

export interface AppConfig {
	app: {
		port: number;
	};
	database: DatabaseConfig;
	jwt: JwtConfig;
}
