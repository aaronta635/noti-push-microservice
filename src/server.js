import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.js';
import { testConnection } from './config/database.js';
import deviceRoutes from './routes/deviceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
    const dbConnected = await testConnection();
    const firebaseInitialized = initializeFirebase() !== null;
    
    res.status(dbConnected && firebaseInitialized ? 200 : 503).json({
        status: dbConnected && firebaseInitialized ? 'ok' : 'unhealthy',
        database: dbConnected ? 'connected' : 'disconnected',
        firebase: firebaseInitialized ? 'initialized' : 'not initialized',
    });
});

// Routes
app.use('/', deviceRoutes);
app.use('/notify', notificationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        await testConnection();
        initializeFirebase();
        
        app.listen(PORT, () => {
            logger.info(`Notification service running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

