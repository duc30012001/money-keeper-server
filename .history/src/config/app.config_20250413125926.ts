export default () => ({
	// Application settings
	app: {
		port:
			(process.env.APP_PORT && parseInt(process.env.APP_PORT, 10)) ||
			3000,
	},

	// Database settings
	database: {
		host: process.env.DB_HOST,
		port:
			(process.env.DB_PORT && parseInt(process.env.DB_PORT, 10)) || 5432,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	},

	// Authentication settings (if needed)
	auth: {
		jwtSecret: process.env.JWT_SECRET,
		jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
	},

	// You can add more configurations here.
	// For example, a setting for a third-party API:
	api: {
		url: process.env.API_URL,
		key: process.env.API_KEY,
	},
});
