/* eslint-disable no-undef */
const CACHE = 'app-v3';

// === CACHE STRATEGY ===
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(req))
  );
});

// === FCM IMPORTS ===
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Forzar takeover inmediato
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Config de tu Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

// Defaults Android
const DEFAULT_ICON  = "icons/icon-192.png";
const DEFAULT_BADGE = "icons/icon-72.png";

// Manejo de notificaciones (solo data messages)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Mensaje BG:', payload);

  // Si viene notification (ej. consola Firebase), deja que el navegador la muestre
  if (payload?.notification) return;

  const d = payload.data || {};
  const title = d.title || 'Notificación';
  const options = {
    body: d.body || '',
    icon: d.icon || DEFAULT_ICON,
    badge: d.badge || DEFAULT_BADGE,
    image: d.image || undefined,
    data: { url: d.url || '/' }
  };

  self.registration.showNotification(title, options);
});

// Click handler para notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});