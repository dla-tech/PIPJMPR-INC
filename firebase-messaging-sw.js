/* eslint-disable no-undef */
// === Service Worker para Firebase Cloud Messaging (FCM) ===
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Misma configuración pública de tu app
firebase.initializeApp({
  apiKey: "AIzaSyA0Yj_GIZqNzMaH5ChzWsSz_spORbHKMiY",
  authDomain: "miappiglesia.firebaseapp.com",
  projectId: "miappiglesia",
  storageBucket: "miappiglesia.firebasestorage.app",
  messagingSenderId: "624809525779",
  appId: "1:624809525779:web:2608aa1d23a84e466a35e6",
  measurementId: "G-8LLBP4ZB45"
});

const messaging = firebase.messaging();

// Notificaciones cuando la PWA está cerrada/segundo plano
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || 'Nueva notificación';
  const body  = payload?.notification?.body  || '';
  const icon  = payload?.notification?.icon  || 'icons/icon-192.png';

  self.registration.showNotification(title, {
    body,
    icon,
    data: payload?.data || {}
  });
});
