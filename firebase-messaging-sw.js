/* eslint-disable no-undef */
// === Service Worker para Firebase Cloud Messaging (FCM) ===
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Forzar que el SW nuevo tome control rápido
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Configuración de tu proyecto (igual que en app.js)
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

// ✅ Iconos por defecto para Android (no afectan iOS Web Push)
const DEFAULT_ICON  = "icons/icon-192.png";  // a color, 192x192
const DEFAULT_BADGE = "icons/icon-72.png";   // blanco con transparencia, 72/96 px

// === BACKGROUND: manejar DATA messages con nuestros defaults ===
messaging.onBackgroundMessage((payload) => {
  console.log('[FM] BG message:', payload);

  // Estrategia A (tuya): si viene "notification", dejamos que el navegador la muestre (evita duplicados)
  if (payload?.notification) {
    return;
  }

  // Si viene como DATA message (Atajos/tu backend), mostramos nosotros con defaults
  const d = payload?.data || {};
  const title = d.title || 'Notificación';
  const options = {
    body: d.body || '',
    icon: d.icon || DEFAULT_ICON,
    badge: d.badge || DEFAULT_BADGE,
    image: d.image || undefined,
    data: {
      url: d.url || '/',
      // puedes añadir más campos si quieres
    }
  };

  self.registration.showNotification(title, options);
});

// === CLICK EN NOTIFICACIÓN: abrir/enfocar la PWA ===
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Enfoca una ventana existente si hay
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      // Si no hay, abre una nueva
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});