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

// --- Helpers: parse patterns from body and build overlay URL ---
function extractPatterns(text){
  const t = String(text || '');
  const mDate = t.match(/#\((\d{4}-\d{2}-\d{2})\)/);    // #(YYYY-MM-DD)
  const mImg  = t.match(/#img\(([^)]+)\)/i);           // #img(URL)
  const mLink = t.match(/#link\(([^)]+)\)/i);          // #link(URL)
  return {
    date: mDate ? mDate[1] : '',
    image: mImg ? mImg[1] : '',
    link: mLink ? mLink[1] : ''
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

// Mensajes en background
messaging.onBackgroundMessage((payload) => {
  // Si viene "notification", deja que el navegador la maneje (evita duplicados).
  // En ese caso, resolveremos la URL en el click (ver handler de 'notificationclick').
  if (payload?.notification) return;

  // Si viene como data message (p. ej. desde Atajos), construiremos nosotros la notificación
  const d = payload?.data || {};
  const title = d.title || 'Notificación';
  const body  = d.body  || '';

  // Extrae patrones del body si no llegan como claves separadas
  const found = extractPatterns(body);
  const meta = {
    date:  d.date  || found.date  || '',
    image: d.image || found.image || '',
    link:  d.link  || found.link  || ''
  };

  const url = d.url || buildNotifUrl(title, body, meta);

  const options = {
    body,
    icon:  d.icon  || DEFAULT_ICON,
    badge: d.badge || DEFAULT_BADGE,
    image: meta.image || undefined,
    data: {
      title,
      body,
      date:  meta.date,
      image: meta.image,
      link:  meta.link,
      url
    }
  };

  self.registration.showNotification(title, options);
});

// Click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Usa la URL guardada en data o constrúyela desde title/body
  let targetUrl = event.notification?.data?.url;
  if (!targetUrl) {
    const nTitle = event.notification?.title || 'Notificación';
    const nBody  = event.notification?.body  || '';
    const found  = extractPatterns(nBody);
    targetUrl = buildNotifUrl(nTitle, nBody, found) || '/';
  }

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (allClients.length > 0) {
      const client = allClients[0];
      const needNav = !client.url.includes(targetUrl);
      if (needNav && 'navigate' in client) {
        try { await client.navigate(targetUrl); } catch(e) {}
      }
      try { await client.focus(); } catch(e) {}
      try { client.postMessage({ type: 'go', url: targetUrl }); } catch(e) {}
      return;
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl);
    }
  })());
});
