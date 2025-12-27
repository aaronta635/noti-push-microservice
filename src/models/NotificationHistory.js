import pool from '../config/database.js';
import logger from '../utils/logger.js';


export async function createNotiHistory(userId, notificationType, title, body, dataPayload, status, errorMessage = null) {
    try {
        const query = `
            INSERT INTO notification_history (user_id, notification_type, title, body, data_payload, status, error_message)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const result = await pool.query(query, [
            userId, 
            notificationType,
            title,
            body,
            JSON.stringify(dataPayload),
            status, 
            errorMessage
        ]);
        return result.rows[0];


    } catch (error) {
        logger.error("Error creating noti history: ", error);
        throw error;
    }
}

export async function findNotiHistoryByUserId(userId, limit = 50) {
    try {
        const query = `
            SELECT * FROM notification_history
            WHERE user_id = $1
            ORDER BY sent_at DESC
            LIMIT $2
        `;

        const result = await pool.query(query, [userId, limit]);
        return result.rows;
    } catch (error) {
        logger.error('Error finding noti history by user ID: ', error);
        throw error;
    }
    
    
}