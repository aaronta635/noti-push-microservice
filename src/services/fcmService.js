import { getMessaging } from '../config/firebase.js';
import logger from '../utils/logger.js';

export async function sendNotifications(deviceToken, title, body, data = {}) {
    try {
        const message = {
            token: deviceToken, 
            notification: {
                title: title,
                body: body
            },
            data: {
                ...Object.keys(data).reduce((acc, key) => {
                    acc[key] = String(data[key]);
                    return acc;
                }, {}),
            },
            android: {
                priority: 'high',
            },
            apns: {
                headers: {
                    'apns-priority': '10',
                },
            },
        };
        
        const response = await getMessaging().send(message);
        logger.info(`Notification sent success: ${response}`);
        return { success: true, messageId: response };
    } catch (error) {
        logger.error('Error sending notification: ', error);

        if (error.code === 'messaging/invalid-registration-token' || 
            error.code === 'messaging/registration-token-not-registered') {
            return { success: false, error: 'invalid_token', errorMessage: error.message };
        };

        return { success: false, error: 'send_failed', errorMessage: error.message };
    }
    
}

export async function sendBatchNotifications(deviceTokens, title, body, data = {}) {
    const results = {
        successful: [],
        failed: [], 
        invalidTokens: []
    };

    for (const token of deviceTokens) {
        const result = await sendNotifications(token, title, body, data);

        if (result.success) {
            results.successful.push(token);
        } else if (result.error === 'invalid_token') {
            results.invalidTokens.push(token);
        } else {
            results.failed.push( { token, error: result.errorMessage } );
        }
    }
    return results;
    
}