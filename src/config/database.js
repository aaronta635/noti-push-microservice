import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create connection pool
// Connection pooling helps manage multiple database connections efficiently
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // These settings help with connection management
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection cannot be established
});

// Test database connection on startup
pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

// Helper function to test connection
export async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database connection test successful:', result.rows[0]);
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
}

// Export the pool for use in models
export default pool;

