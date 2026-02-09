/* eslint-disable no-undef */
/* === SERVICE WORKER ÚNICO: CACHE + FIREBASE FCM === */

// =====================
// 🔥 Firebase (compat)
// =====================
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// =====================
// ⚙️ CONFIG
// =====================
const CACHE = 'app-v4';
const DEFAULT_ICON  = 'icons/icon-192.png';
const DEFAULT_BADGE = 'icons/icon-72.png';

// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

// =====================
// 🚀 CICLO DE VIDA
// =====================
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// =====================
// 📦 CACHE / FETCH
// =====================
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return resp;
      })
      .catch(() => caches.match(req))
  );
});

// =====================
// 🧠 HELPERS
// =====================
function extractPatterns(text){
  const t = String(text || '');
  return {
    date:  (t.match(/#\((\d{4}-\d{2}-\d{2})\)/) || [])[1] || '',
    image: (t.match(/#img\(([^)]+)\)/i) || [])[1] || '',
    link:  (t.match(/#link\(([^)]+)\)/i) || [])[1] || ''
  };
}

function buildNotifUrl(title, body, extra){
  const q = new URLSearchParams({
    title, body,
    date:  extra?.date  || '',
    image: extra?.image || '',
    link:  extra?.link  || ''
  });
  return '/#/notif?' + q.toString();
}

// =====================
// 🔔 FCM BACKGROUND
// =====================
messaging.onBackgroundMessage((payload) => {
  if (payload?.notification) return; // evita duplicados

  const d = payload?.data || {};
  const title = d.title || 'Notificación';
  const body  = d.body  || '';

  const found = extractPatterns(body);
  const meta = {
    date:  d.date  || found.date,
    image: d.image || found.image,
    link:  d.link  || found.link
  };

  const url = d.url || buildNotifUrl(title, body, meta);

  self.registration.showNotification(title, {
    body,
    icon:  d.icon  || DEFAULT_ICON,
    badge: d.badge || DEFAULT_BADGE,
    image: meta.image || undefined,
    data: { title, body, ...meta, url }
  });
});

// =====================
// 👉 CLICK NOTIFICACIÓN
// =====================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil((async () => {
    const clientsArr = await self.clients.matchAll({ type:'window', includeUncontrolled:true });
    if (clientsArr.length) {
      const client = clientsArr[0];
      await client.navigate(targetUrl);
      return client.focus();
    }
    return self.clients.openWindow(targetUrl);
  })());
});
