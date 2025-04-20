import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig = (): CorsOptions => {
	// Read allowed domains from the environment variable.
	// Expected format: "ant-music.net,ant-group.net"
	const originsEnv = process.env.CORS_ORIGINS || '';

	// Split the string by comma, trim whitespace, and filter out empty items.
	const allowedDomains = originsEnv
		.split(',')
		.map((domain) => domain.trim())
		.filter((domain) => domain.length > 0);

	// For each domain, create a RegExp that allows the main domain and any subdomain.
	const allowedRegexes = allowedDomains.map((domain) => {
		// Escape dots in the domain to create a valid regex.
		const escapedDomain = domain.replace(/\./g, '\\.');
		// This regex will match URLs that start with http:// or https://,
		// then either no subdomain or any subdomain, followed by the allowed domain.
		return new RegExp(`^https?:\\/\\/(.*\\.)?${escapedDomain}$`);
	});

	// Return the CORS options with the "origin" property set to the regex array.
	return {
		origin: allowedRegexes,
	};
};
