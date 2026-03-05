import api from './api';
import { requestFCMToken, onForegroundMessage } from './firebase';

/**
 * Subscribe the user to push notifications via Firebase Cloud Messaging.
 * Called after login/on app startup when user is authenticated.
 */
export async function subscribeToPush() {
  try {
    // Check browser support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported in this browser');
      return false;
    }

    // Get FCM token (this also requests notification permission)
    const fcmToken = await requestFCMToken();
    if (!fcmToken) {
      console.log('Could not get FCM token');
      return false;
    }

    // Send FCM token to backend
    await api.post('/push/subscribe', {
      fcm_token: fcmToken
    });

    console.log('FCM token registered with backend successfully');
    return true;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return false;
  }
}

/**
 * Set up foreground message handler.
 * Shows a browser notification when a message arrives while the app is open.
 */
export function setupForegroundNotifications() {
  return onForegroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || 'LifeOS';
    const body = payload.notification?.body || payload.data?.body || 'You have a notification';

    // Show notification even when app is in foreground
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: payload.data?.tag || 'lifeos',
        data: { url: payload.data?.url || '/calendar' }
      });
    }
  });
}

/**
 * Send a test push notification to verify everything works.
 */
export async function sendTestPush() {
  try {
    await api.post('/push/test');
    return true;
  } catch (error) {
    console.error('Test push failed:', error);
    return false;
  }
}
