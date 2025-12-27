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

        // Get path to service account JSON
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        
        if (!serviceAccountPath) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set in environment variables');
        }

        // Read service account credentials
        const serviceAccount = JSON.parse(
            readFileSync(serviceAccountPath, 'utf8')
        );

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

