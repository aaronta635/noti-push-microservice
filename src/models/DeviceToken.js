import pool from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * DeviceToken Model
 * Handles all database operations for device tokens
 */

/**
 * Create or update a device token
 * If token already exists for this user, update it; otherwise create new
 * This is an "upsert" operation (update or insert)
 */
export async function upsertDeviceToken(userId, deviceToken, platform) {
    try {
        // Validate platform
        if (platform !== 'ios' && platform !== 'android') {
            throw new Error('Platform must be either "ios" or "android"');
        }

        // Use PostgreSQL's ON CONFLICT to handle upsert
        // This checks if (user_id, device_token) combination already exists
        const query = `
            INSERT INTO device_tokens (user_id, device_token, platform, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, device_token)
            DO UPDATE SET 
                platform = EXCLUDED.platform,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const result = await pool.query(query, [userId, deviceToken, platform]);
        
        logger.info(`Device token ${result.rows[0].id ? 'updated' : 'created'} for user ${userId}`);
        return result.rows[0];
    } catch (error) {
        logger.error('Error upserting device token:', error);
        throw error;
    }
}

/**
 * Find all device tokens for a user
 * A user can have multiple devices (phone, tablet, etc.)
 */
export async function findTokensByUserId(userId) {
    try {
        const query = 'SELECT * FROM device_tokens WHERE user_id = $1';
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        logger.error('Error finding device tokens by user ID:', error);
        throw error;
    }
}

/**
 * Find device tokens for multiple users
 * Used when sending notifications to multiple users (e.g., vendor followers)
 */
export async function findTokensByUserIds(userIds) {
    try {
        if (!userIds || userIds.length === 0) {
            return [];
        }

        // Use ANY() to match any user_id in the array
        const query = 'SELECT * FROM device_tokens WHERE user_id = ANY($1::text[])';
        const result = await pool.query(query, [userIds]);
        return result.rows;
    } catch (error) {
        logger.error('Error finding device tokens by user IDs:', error);
        throw error;
    }
}

/**
 * Delete a device token
 * Called when user logs out or uninstalls app
 */
export async function deleteDeviceToken(userId, deviceToken) {
    try {
        const query = 'DELETE FROM device_tokens WHERE user_id = $1 AND device_token = $2 RETURNING *';
        const result = await pool.query(query, [userId, deviceToken]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        logger.info(`Device token deleted for user ${userId}`);
        return result.rows[0];
    } catch (error) {
        logger.error('Error deleting device token:', error);
        throw error;
    }
}

/**
 * Delete all device tokens for a user
 * Useful when user account is deleted
 */
export async function deleteAllTokensByUserId(userId) {
    try {
        const query = 'DELETE FROM device_tokens WHERE user_id = $1';
        await pool.query(query, [userId]);
        logger.info(`All device tokens deleted for user ${userId}`);
    } catch (error) {
        logger.error('Error deleting all device tokens by user ID:', error);
        throw error;
    }
}

/**
 * Get all device tokens
 * Used for broadcasting notifications to all users (e.g., hot deals)
 */
export async function getAllDeviceTokens() {
    try {
        const query = 'SELECT * FROM device_tokens';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        logger.error('Error getting all device tokens:', error);
        throw error;
    }
}

