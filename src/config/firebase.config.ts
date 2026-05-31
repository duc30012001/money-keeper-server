import * as admin from 'firebase-admin';
import { join } from 'path';

const serviceAccountPath =
	process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
	join(__dirname, '../../firebase-service-account.json');

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccountPath),
	});
}

export const firebaseAdmin = admin;
export const firebaseAuth = admin.auth();
