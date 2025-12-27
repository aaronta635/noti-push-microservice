import express from 'express';
import { body } from 'express-validator';
import { upsertDeviceToken, deleteDeviceToken } from '../models/DeviceToken.js';
import { handleValidationErrors } from '../middleware/validation.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /register-device
 * Register or update a device token for push notifications
 * 
 * Request body:
 * {
 *   "user_id": "user123",
 *   "device_token": "fcm_token_here",
 *   "platform": "ios" or "android"
 * }
 */
router.post(
    '/register-device',
    [
        body('user_id').notEmpty().withMessage('user_id is required'),
        body('device_token').notEmpty().withMessage('device_token is required'),
        body('platform').isIn(['ios', 'android']).withMessage('platform must be ios or android'),
        handleValidationErrors,
    ],
    async (req, res, next) => {
        try {
            const { user_id, device_token, platform } = req.body;
            const deviceToken = await upsertDeviceToken(user_id, device_token, platform);
            
            res.status(200).json({
                success: true,
                message: 'Device token registered successfully',
                data: deviceToken,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /unregister-device
 * Remove a device token (when user logs out or uninstalls app)
 * 
 * Request body:
 * {
 *   "user_id": "user123",
 *   "device_token": "fcm_token_here"
 * }
 */
router.delete(
    '/unregister-device',
    [
        body('user_id').notEmpty().withMessage('user_id is required'),
        body('device_token').notEmpty().withMessage('device_token is required'),
        handleValidationErrors,
    ],
    async (req, res, next) => {
        try {
            const { user_id, device_token } = req.body;
            const result = await deleteDeviceToken(user_id, device_token);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'Device token not found',
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Device token unregistered successfully',
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;

