import express from 'express';
import { body } from 'express-validator';
import { sendHotDealNotification, sendOrderConfirmationNotification } from '../services/notificationService.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /notify/hot-deal
 * Notify all users about a hot deal of the day
 * 
 * Request body:
 * {
 *   "deal": {
 *     "id": "deal123",
 *     "title": "50% Off Fresh Produce",
 *     "description": "Amazing deals on fresh fruits and vegetables",
 *     "vendor_id": "vendor123", // optional
 *     "discount": "50", // optional
 *     "expires_at": "2024-12-31T23:59:59Z" // optional
 *   }
 * }
 */
router.post(
    '/hot-deal',
    [
        body('deal').isObject().withMessage('deal must be an object'),
        body('deal.id').notEmpty().withMessage('deal.id is required'),
        body('deal.title').notEmpty().withMessage('deal.title is required'),
        handleValidationErrors,
    ],
    async (req, res, next) => {
        try {
            const { deal } = req.body;
            const result = await sendHotDealNotification(deal);
            
            res.status(200).json({
                success: true,
                message: 'Hot deal notifications sent',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /notify/order-confirm
 * Notify a user when their order is confirmed
 * 
 * Request body:
 * {
 *   "user_id": "user123",
 *   "order": {
 *     "id": "order456",
 *     "status": "confirmed"
 *   }
 * }
 */
router.post(
    '/order-confirm',
    [
        body('user_id').notEmpty().withMessage('user_id is required'),
        body('order').isObject().withMessage('order must be an object'),
        body('order.id').notEmpty().withMessage('order.id is required'),
        body('order.status').notEmpty().withMessage('order.status is required'),
        handleValidationErrors,
    ],
    async (req, res, next) => {
        try {
            const { user_id, order } = req.body;
            const result = await sendOrderConfirmationNotification(user_id, order);
            
            res.status(200).json({
                success: true,
                message: 'Order confirmation notification sent',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;

