import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
}

export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
}