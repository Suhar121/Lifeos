import api from './api';

/**
 * Subscribe the user to push notifications.
 * Called after login/on app startup when user is authenticated.
 */
export async function subscribeToPush() {
  try {
    // Check browser support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported in this browser');
      return false;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from backend
    const { data } = await api.get('/push/vapid-public-key');
    const vapidPublicKey = data.publicKey;

    if (!vapidPublicKey) {
      console.error('No VAPID public key from server');
      return false;
    }

    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe old subscription to force re-subscribe with current VAPID key
      // This ensures subscriptions always match the current server VAPID key
      try {
        await subscription.unsubscribe();
        console.log('Unsubscribed old push subscription');
      } catch (e) {
        console.warn('Failed to unsubscribe old push:', e);
      }
      subscription = null;
    }

    // Create new subscription with current VAPID key
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    // Send subscription to backend
    const subJson = subscription.toJSON();
    await api.post('/push/subscribe', {
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth
    });

    console.log('Push subscription registered successfully');
    return true;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return false;
  }
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

/**
 * Convert a URL-safe base64 string to a Uint8Array (for applicationServerKey).
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
