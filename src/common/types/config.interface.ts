export interface DatabaseConfig {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
}

export interface FirebaseConfig {
	serviceAccountPath: string;
}

export interface AppConfig {
	app: {
		port: number;
	};
	database: DatabaseConfig;
	firebase: FirebaseConfig;
}
