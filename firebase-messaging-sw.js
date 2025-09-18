/* eslint-disable no-undef */
// === Service Worker para Firebase Cloud Messaging (FCM) ===
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Forzar que el SW nuevo tome control rápido
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Configuración de tu proyecto
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

// Estrategia A: dejar que el navegador maneje notification payloads.
// No hacemos showNotification, así NO hay duplicados.
messaging.onBackgroundMessage((payload) => {
  console.log('[FM A] Mensaje en background:', payload);
  if (payload?.notification) {
    // navegador se encarga de mostrarla
    return;
  }
});