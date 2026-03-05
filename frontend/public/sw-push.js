// Custom service worker additions for Firebase Cloud Messaging
// This file is injected into the PWA service worker by vite-plugin-pwa (workbox importScripts)

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase inside the PWA service worker
firebase.initializeApp({
  apiKey: "AIzaSyA-2AC3-jdiiTFYomIqj8N4h8Obuwz3lKs",
  authDomain: "lifeos-63290.firebaseapp.com",
  projectId: "lifeos-63290",
  storageBucket: "lifeos-63290.firebasestorage.app",
  messagingSenderId: "757798594903",
  appId: "1:757798594903:web:9453959d8dab4015a7b612",
  measurementId: "G-41LE0SXNBJ"
});

const messaging = firebase.messaging();

// Handle background FCM messages (when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background FCM message received:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'LifeOS';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a notification',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: payload.data?.tag || 'lifeos',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: payload.data?.url || '/calendar',
      ...payload.data
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open the app to the right page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
