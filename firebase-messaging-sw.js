/* firebase-messaging-sw.js */
/* eslint-disable no-undef */

self.__SW_VERSION__ = 'fcm-sw-v3'; // cambia esto si quieres forzar update

importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

// ✅ TU MISMA CONFIG de APP_CONFIG.firebase.app
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

/* ───────── Helpers ───────── */
function pickPayload(raw) {
  const d = (raw && raw.data) ? raw.data : {};
  const n = (raw && raw.notification) ? raw.notification : {};

  // id “real” para dedupe por ID (si viene)
  const id = raw?.messageId || d.id || d.msgId || '';

  return {
    id,
    ts: Date.now(),
    title: d.title || n.title || 'Notificación',
    body:  d.body  || n.body  || '',
    date:  d.date  || '',
    image: d.image || n.image || '',
    link:  d.link  || d.url || ''
  };
}

async function broadcastToClients(msg) {
  try {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) c.postMessage(msg);
  } catch (_) {}
}

// URL a abrir cuando tocan la notificación
function buildOpenUrl(p) {
  // Abre tu app (scope) + hash con data
  const qs = new URLSearchParams();
  qs.set('title', encodeURIComponent(p.title || ''));
  qs.set('body',  encodeURIComponent(p.body  || ''));
  if (p.date)  qs.set('date',  encodeURIComponent(p.date));
  if (p.image) qs.set('image', encodeURIComponent(p.image));
  if (p.link)  qs.set('link',  encodeURIComponent(p.link));

  // Esto debe coincidir con tu overlay: #/notif?...
  return `${self.registration.scope}#/notif?${qs.toString()}`;
}

/* ───────── Background messages (FCM) ─────────
   Nota: cuando envías "data" payload, llega aquí perfecto.
*/
messaging.onBackgroundMessage(async (payload) => {
  const p = pickPayload(payload);

  // 1) Guardar en campana (PWA) SIEMPRE
  await broadcastToClients({ type: 'notif:new', payload: p });

  // 2) Mostrar notificación del sistema
  const options = {
    body: p.body || '',
    icon: p.image || undefined, // puedes cambiar a tu ícono fijo si quieres
    image: p.image || undefined,
    data: {
      openUrl: buildOpenUrl(p),
      raw: p
    }
  };

  // Evita que falle si title vacío
  const title = p.title || 'Notificación';
  await self.registration.showNotification(title, options);
});

/* ───────── Click de notificación ───────── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const openUrl = event.notification?.data?.openUrl || self.registration.scope;
  event.waitUntil((async () => {
    // Marca como leída en la PWA (si está abierta)
    await broadcastToClients({ type: 'notif:open', url: openUrl });

    // Enfoca si ya hay una ventana abierta, si no abre una nueva
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const client of clientList) {
      try {
        // Si ya está en tu app, enfoca y navega al hash
        if (client.url && client.url.startsWith(self.registration.scope)) {
          await client.focus();
          client.postMessage({ type: 'notif:navigate', url: openUrl });
          return;
        }
      } catch (_) {}
    }

    // No había ventana: abre
    await self.clients.openWindow(openUrl);
  })());
});

/* ───────── Lifecycle: asegurar actualización rápida ───────── */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
