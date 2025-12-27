import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// Get current directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseApp = null;

// Initialize Firebase Admin SDK
// This only needs to happen once when the service starts
export function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        if (admin.apps.length > 0) {
            console.log('Firebase already initialized');
            firebaseApp = admin.app();
            return firebaseApp;
        }

        let serviceAccount;

        // Option 1: Read from environment variable (for Railway/production)
        // This is the preferred method for deployment
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
                console.log('Firebase credentials loaded from environment variable');
            } catch (parseError) {
                throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
            }
        }
        // Option 2: Read from file (for local development)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            try {
                serviceAccount = JSON.parse(
                    readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
                );
                console.log('Firebase credentials loaded from file');
            } catch (fileError) {
                throw new Error(`Failed to read Firebase service account file: ${fileError.message}`);
            }
        }
        else {
            throw new Error('Either FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH must be set');
        }

        // Initialize Firebase Admin
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('Firebase Admin initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        throw error;
    }
}

// Get Firebase app instance
export function getFirebaseApp() {
    if (!firebaseApp) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return firebaseApp;
}

// Export messaging service for sending notifications
export function getMessaging() {
    return admin.messaging(getFirebaseApp());
}

