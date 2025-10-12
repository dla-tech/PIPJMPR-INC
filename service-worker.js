/* eslint-disable no-undef */
/* === Service Worker unificado: caché + notificaciones (FCM) === */

// --- 🧱 CONFIGURACIÓN DE CACHÉ ---
const CACHE = 'app-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // tomar control inmediato
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Manejo de navegación offline
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // Solo GET
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

// --- 🔥 FIREBASE CLOUD MESSAGING ---
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Tu configuración Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

// Iconos predeterminados
const DEFAULT_ICON  = "icons/icon-192.png";
const DEFAULT_BADGE = "icons/icon-72.png";

// Avisar al front (bandeja de campana)
async function broadcastToClients(msg){
  try{
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) { try { c.postMessage(msg); } catch(_){} }
  }catch(_){}
}

// Extraer patrones (para overlays)
function extractPatterns(text){
  const t = String(text || '');
  const mDate = t.match(/#\((\d{4}-\d{2}-\d{2})\)/);
  const mImg  = t.match(/#img\(([^)]+)\)/i);
  const mLink = t.match(/#link\(([^)]+)\)/i);
  return {
    date:  mDate ? mDate[1] : '',
    image: mImg  ? mImg[1]  : '',
    link:  mLink ? mLink[1] : ''
  };
}

function buildNotifUrl(title, body, extra){
  const q = new URLSearchParams({
    title: String(title || 'Notificación'),
    body:  String(body || ''),
    date:  extra?.date  || '',
    image: extra?.image || '',
    link:  extra?.link  || ''
  });
  return '/#/notif?' + q.toString();
}

function makeInboxPayload({title, body, date, image, link}){
  return {
    title: String(title || 'Notificación').slice(0,140),
    body:  String(body || ''),
    date:  date  || '',
    image: image || '',
    link:  link  || ''
  };
}

// --- 🔔 Mensajes en background ---
messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const notif = payload?.notification || null;

  if (notif) {
    // Dejar que el navegador la muestre
    const title = notif.title || 'Notificación';
    const body  = notif.body  || '';
    const found = extractPatterns(body);
    const meta = {
      date:  data.date  || found.date  || '',
      image: data.image || found.image || '',
      link:  data.link  || found.link  || ''
    };

    // Avisar a la campana interna
    broadcastToClients({
      type: 'notif:new',
      payload: makeInboxPayload({ title, body, date: meta.date, image: meta.image, link: meta.link })
    });
    return;
  }

  // Data-only (mostramos manualmente)
  const title = data.title || 'Notificación';
  const body  = data.body  || '';
  const found = extractPatterns(body);
  const meta = {
    date:  data.date  || found.date  || '',
    image: data.image || found.image || '',
    link:  data.link  || found.link  || ''
  };
  const url = data.url || buildNotifUrl(title, body, meta);

  const options = {
    body,
    icon:  data.icon  || DEFAULT_ICON,
    badge: data.badge || DEFAULT_BADGE,
    image: meta.image || undefined,
    vibrate: [200, 100, 200],
    data: { title, body, date: meta.date, image: meta.image, link: meta.link, url }
  };

  self.registration.showNotification(title, options);

  broadcastToClients({
    type: 'notif:new',
    payload: makeInboxPayload({ title, body, date: meta.date, image: meta.image, link: meta.link })
  });
});

// --- 👆 Click en la notificación ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let targetUrl = event.notification?.data?.url;

  if (!targetUrl) {
    const nTitle = event.notification?.title || 'Notificación';
    const nBody  = event.notification?.body  || '';
    const found  = extractPatterns(nBody);
    targetUrl = buildNotifUrl(nTitle, nBody, found) || '/';
  }

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (allClients.length) {
      const client = allClients[0];
      try {
        const needNav = !client.url.includes(targetUrl);
        if (needNav && 'navigate' in client) await client.navigate(targetUrl);
        await client.focus();
      } catch(_) {}
      broadcastToClients({ type: 'notif:open', url: targetUrl });
      return;
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
      setTimeout(()=>broadcastToClients({ type: 'notif:open', url: targetUrl }), 500);
    }
  })());
});