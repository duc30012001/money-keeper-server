export interface JwtPayload {
	sub: string; // user ID
	email: string; // user email
	iat?: number; // issued at
	exp?: number; // expiration
}
