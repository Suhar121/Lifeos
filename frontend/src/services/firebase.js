// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA-2AC3-jdiiTFYomIqj8N4h8Obuwz3lKs",
  authDomain: "lifeos-63290.firebaseapp.com",
  projectId: "lifeos-63290",
  storageBucket: "lifeos-63290.firebasestorage.app",
  messagingSenderId: "757798594903",
  appId: "1:757798594903:web:9453959d8dab4015a7b612",
  measurementId: "G-41LE0SXNBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging — only if the browser supports it
// isSupported() checks for ServiceWorker, PushManager, IndexedDB, and Notification API
let messaging = null;
let _messagingReady = isSupported().then((supported) => {
  if (supported) {
    try {
      messaging = getMessaging(app);
    } catch (err) {
      console.warn('Firebase Messaging init failed:', err);
    }
  } else {
    console.warn('Firebase Messaging: browser does not support required APIs (Push/SW/IDB)');
  }
}).catch((err) => {
  console.warn('Firebase isSupported() check failed:', err);
});

// VAPID key from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
const VAPID_KEY = 'BO58Owzq5cFjEDz591GUsoRIQ4oSnkWkDaRL1M3ND23hSuAn11ZEiOJaui9SHFAjJYkpEYIPquxewxFfzxgXYpE';

/**
 * Request permission and get FCM token.
 * Returns the FCM token string or null if denied/unsupported.
 */
export async function requestFCMToken() {
  console.log('[FCM] Step 1: Checking messaging support...');
  // Wait for the async isSupported() check to complete
  await _messagingReady;
  if (!messaging) {
    console.warn('[FCM] FAILED: Firebase Messaging not available in this browser');
    return null;
  }

  try {
    console.log('[FCM] Step 2: Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('[FCM] Step 2 result: permission =', permission);
    if (permission !== 'granted') {
      console.log('[FCM] FAILED: Notification permission denied');
      return null;
    }

    console.log('[FCM] Step 3: Registering Firebase service worker...');
    // Try dedicated Firebase SW first, fall back to PWA SW
    let swRegistration;
    try {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('[FCM] Step 3 result: Firebase SW registered, scope =', swRegistration.scope);
      // Wait for it to be active
      if (!swRegistration.active) {
        await new Promise((resolve) => {
          const sw = swRegistration.installing || swRegistration.waiting;
          if (sw) {
            sw.addEventListener('statechange', () => {
              if (sw.state === 'activated') resolve();
            });
          } else {
            resolve();
          }
        });
      }
    } catch (swErr) {
      console.warn('[FCM] Firebase SW failed, falling back to PWA SW:', swErr.message);
      swRegistration = await navigator.serviceWorker.ready;
    }

    console.log('[FCM] Step 4: Requesting FCM token with VAPID key...');
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    });

    if (token) {
      console.log('[FCM] Step 4 SUCCESS: Token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('[FCM] FAILED: getToken returned null/empty');
      return null;
    }
  } catch (err) {
    console.error('[FCM] FAILED at error:', err.message || err);
    console.error('[FCM] Full error:', err);
    return null;
  }
}

/**
 * Listen for foreground messages.
 * Call this once in your App component to handle notifications when the app is open.
 */
export async function onForegroundMessage(callback) {
  await _messagingReady;
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('Foreground FCM message:', payload);
    callback(payload);
  });
}

export { app, messaging };
