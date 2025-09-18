/* firebase-messaging-sw.js */
// Service Worker para Firebase Messaging

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

// === Notificaciones en background ===
messaging.onBackgroundMessage((payload) => {
  console.log('[FM] BG message:', payload);
  const n = payload.notification || {};
  const d = payload.data || {};

  const title = n.title || d.title || 'Notificación';
  const body  = n.body  || d.body  || '';
  const url   = d.url || `/#/notif?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

  const options = {
    body,
    icon: d.icon || "icons/icon-192.png",
    badge: d.badge || "icons/icon-72.png",
    image: d.image || undefined,
    data: { url }
  };

  self.registration.showNotification(title, options);
});

// === Click: abre la app con hash ===
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});