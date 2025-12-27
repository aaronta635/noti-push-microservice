-- Database schema for notification service

-- Device tokens table
-- Stores device tokens for push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    device_token TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_token)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(device_token);

-- Notification history table (optional, for logging and analytics)
CREATE TABLE IF NOT EXISTS notification_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data_payload JSONB,
    status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying notification history
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at);

