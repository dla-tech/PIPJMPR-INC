/* eslint-disable no-undef */
// === Service Worker para Firebase Cloud Messaging (FCM) ===
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Forzar que el SW nuevo tome control rápido
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });

// Configuración del MISMO proyecto que tu index.html: miappiglesia-c703a
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

// Notificaciones cuando la PWA está en 2º plano / cerrada
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || 'Nueva notificación';
  const body  = payload?.notification?.body  || '';
  const icon  = payload?.notification?.icon  || '/icons/icon-192.png';

  self.registration.showNotification(title, {
    body,
    icon,
    data: payload?.data || {}
  });
});
