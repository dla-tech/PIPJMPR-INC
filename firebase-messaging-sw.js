/* firebase-messaging-sw.js */
'use strict';

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const cfg = (self.APP_CONFIG && self.APP_CONFIG.firebase && self.APP_CONFIG.firebase.app)
  ? self.APP_CONFIG
  : null;

// 🔹 Si no puedes leer APP_CONFIG dentro del SW, pega aquí tu firebaseConfig manual:
const firebaseConfig = cfg?.firebase?.app || {
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Helper: arma el hash que tu app entiende
function buildNotifHash(data){
  const qs = new URLSearchParams();
  qs.set('title', data?.title || 'Notificación');
  qs.set('body',  data?.body  || '');
  if (data?.date)  qs.set('date',  data.date);
  if (data?.image) qs.set('image', data.image);
  if (data?.link)  qs.set('link',  data.link);
  return '#/notif?' + qs.toString();
}

// ✅ Background message (llega con app cerrada)
messaging.onBackgroundMessage((payload) => {
  const d = payload?.data || {};
  const title = d.title || payload?.notification?.title || 'Notificación';
  const body  = d.body  || payload?.notification?.body  || '';
  const image = d.image || '';
  const link  = d.link  || '';
  const date  = d.date  || '';

  const hash = buildNotifHash({ title, body, image, link, date });

  const options = {
    body,
    data: {
      url: (self.location.origin + '/' + hash),
      title,
      body
    }
  };

  if (image) options.image = image;

  self.registration.showNotification(title, options);
});

// ✅ Click: abre la PWA con el hash para que app.js la guarde en la campana
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || (self.location.origin + '/');

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    // Si ya hay una ventana abierta, enfócala y navega
    for (const c of allClients) {
      try {
        await c.focus();
        c.navigate(url);
        return;
      } catch (_) {}
    }

    // Si no hay, abre nueva
    await clients.openWindow(url);
  })());
});