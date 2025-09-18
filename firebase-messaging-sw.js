/* eslint-disable no-undef */
// === Service Worker para Firebase Cloud Messaging (FCM) ===
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Forzar que el SW nuevo tome control rápido
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Config de tu proyecto
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

// Iconos por defecto Android
const DEFAULT_ICON  = "icons/icon-192.png";
const DEFAULT_BADGE = "icons/icon-72.png";

// Mensajes en background
messaging.onBackgroundMessage((payload) => {
  // Si viene "notification", deja que el navegador la maneje (evita duplicados)
  if (payload?.notification) return;

  // Si viene como data message (tus atajos), mándala nosotros
  const d = payload?.data || {};
  const title = d.title || 'Notificación';
  const options = {
    body: d.body || '',
    icon: d.icon || DEFAULT_ICON,
    badge: d.badge || DEFAULT_BADGE,
    image: d.image || undefined,
    data: {
      url: d.url || '/',
    }
  };
  self.registration.showNotification(title, options);
});

// Click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});