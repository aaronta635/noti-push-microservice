import { findTokensByUserId, getAllDeviceTokens } from '../models/DeviceToken.js';
import { createNotiHistory } from '../models/NotificationHistory.js';
import { sendBatchNotifications } from './fcmService.js';
import logger from '../utils/logger.js';

/**
 * Send hot deal notification to all users
 * This is for deals of the day or special promotions
 */
export async function sendHotDealNotification(deal) {
    try {
        // Get all device tokens for all users
        const deviceTokens = await getAllDeviceTokens();
        
        if (deviceTokens.length === 0) {
            logger.info('No device tokens found for hot deal notification');
            return { sent: 0, failed: 0 };
        }

        // Format notification message
        const title = deal.title || 'Hot Deal of the Day!';
        const body = deal.description || 'Check out this amazing deal!';
        
        const data = {
            type: 'hot_deal',
            deal_id: deal.id,
            deal_title: deal.title,
        };

        // Add optional fields if provided
        if (deal.vendor_id) data.vendor_id = deal.vendor_id;
        if (deal.discount) data.discount = deal.discount;
        if (deal.expires_at) data.expires_at = deal.expires_at;

        // Send notifications to all devices
        const tokens = deviceTokens.map(dt => dt.device_token);
        const results = await sendBatchNotifications(tokens, title, body, data);

        // Log notification history for each user
        const userIds = [...new Set(deviceTokens.map(dt => dt.user_id))];
        for (const userId of userIds) {
            const userTokens = deviceTokens.filter(dt => dt.user_id === userId);
            const userTokenStrings = userTokens.map(dt => dt.device_token);
            const userSuccessCount = userTokenStrings.filter(token => 
                results.successful.includes(token)
            ).length;
            
            const status = userSuccessCount > 0 ? 'sent' : 'failed';
            await createNotiHistory(
                userId,
                'hot_deal',
                title,
                body,
                data,
                status,
                status === 'failed' ? 'Send failed' : null
            );
        }

        logger.info(`Hot deal notification: ${results.successful.length} sent, ${results.failed.length} failed`);
        
        return {
            sent: results.successful.length,
            failed: results.failed.length,
            invalidTokens: results.invalidTokens.length,
            totalUsers: userIds.length,
        };
    } catch (error) {
        logger.error('Error sending hot deal notification:', error);
        throw error;
    }
}

/**
 * Send order confirmation notification to a specific user
 */
export async function sendOrderConfirmationNotification(userId, order) {
    try {
        const deviceTokens = await findTokensByUserId(userId);
        
        if (deviceTokens.length === 0) {
            logger.info(`No device tokens found for user ${userId}`);
            return { sent: 0, failed: 0 };
        }

        const title = 'Order Confirmed!';
        const body = `Your order #${order.id} has been confirmed`;
        const data = {
            type: 'order_confirm',
            order_id: order.id,
            order_status: order.status,
        };

        const tokens = deviceTokens.map(dt => dt.device_token);
        const results = await sendBatchNotifications(tokens, title, body, data);

        // Log notification history
        for (const deviceToken of deviceTokens) {
            const tokenResult = results.successful.includes(deviceToken.device_token) 
                ? 'sent' 
                : 'failed';
            
            await createNotiHistory(
                userId,
                'order_confirm',
                title,
                body,
                data,
                tokenResult,
                tokenResult === 'failed' ? 'Send failed' : null
            );
        }

        logger.info(`Order confirmation notification: ${results.successful.length} sent, ${results.failed.length} failed`);
        
        return {
            sent: results.successful.length,
            failed: results.failed.length,
            invalidTokens: results.invalidTokens.length,
        };
    } catch (error) {
        logger.error('Error sending order confirmation notification:', error);
        throw error;
    }
}
