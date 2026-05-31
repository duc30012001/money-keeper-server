export interface JwtPayload {
	sub: string; // internal user ID
	firebaseUid: string;
	email: string;
}
