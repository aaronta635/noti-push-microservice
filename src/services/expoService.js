import { Expo } from 'expo-server-sdk';
import logger from '../utils/logger.js';

const expo = new Expo(
  process.env.EXPO_ACCESS_TOKEN
    ? { accessToken: process.env.EXPO_ACCESS_TOKEN }
    : undefined
);

export async function sendNotifications(deviceToken, title, body, data = {}) {
  if (!Expo.isExpoPushToken(deviceToken)) {
    return { success: false, error: 'invalid_token', errorMessage: 'Not an Expo push token' };
  }

  const message = { to: deviceToken, sound: 'default', title, body, data, priority: 'high' };

  try {
    const tickets = await expo.sendPushNotificationsAsync([message]);
    const ticket = tickets?.[0];
    if (!ticket) return { success: false, error: 'send_failed', errorMessage: 'No ticket' };
    if (ticket.status === 'ok') return { success: true, messageId: ticket.id };

    const expoError = ticket.details?.error;
    if (expoError === 'DeviceNotRegistered') {
      return { success: false, error: 'invalid_token', errorMessage: ticket.message || 'DeviceNotRegistered' };
    }
    return { success: false, error: 'send_failed', errorMessage: ticket.message || 'Expo push error' };
  } catch (error) {
    logger.error('Error sending Expo notification', error);
    return { success: false, error: 'send_failed', errorMessage: error.message };
  }
}

export async function sendBatchNotifications(deviceTokens, title, body, data = {}) {
  const results = { successful: [], failed: [], invalidTokens: [] };
  const messages = [];
  const tokenByMessageIndex = [];

  for (const token of deviceTokens) {
    if (!Expo.isExpoPushToken(token)) {
      results.invalidTokens.push(token);
      continue;
    }
    messages.push({ to: token, sound: 'default', title, body, data, priority: 'high' });
    tokenByMessageIndex.push(token);
  }

  if (messages.length === 0) return results;

  try {
    const chunks = expo.chunkPushNotifications(messages);
    let baseIndex = 0;

    for (const chunk of chunks) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const token = tokenByMessageIndex[baseIndex + i];

        if (ticket.status === 'ok') {
          results.successful.push(token);
        } else {
          const expoError = ticket.details?.error;
          if (expoError === 'DeviceNotRegistered') {
            results.invalidTokens.push(token);
          } else {
            results.failed.push({ token, error: ticket.message || 'Expo push error' });
          }
        }
      }
      baseIndex += chunk.length;
    }
    return results;
  } catch (error) {
    logger.error('Error sending Expo batch notifications:', error);
    for (const token of tokenByMessageIndex) {
      results.failed.push({ token, error: error.message });
    }
    return results;
  }
}