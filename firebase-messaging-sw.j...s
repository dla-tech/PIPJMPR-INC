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

// Iconos por defecto Android/Web
const DEFAULT_ICON  = "icons/icon-192.png";
const DEFAULT_BADGE = "icons/icon-72.png";

// ✅ Enviar mensajes a todas las ventanas abiertas de la app (para la bandeja/campanita)
async function broadcastToClients(msg){
  try{
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of allClients){
      try { c.postMessage(msg); } catch(_) {}
    }
  }catch(_){}
}

// --- Helpers: parse patterns from body and build overlay URL ---
function extractPatterns(text){
  const t = String(text || '');
  const mDate = t.match(/#\((\d{4}-\d{2}-\d{2})\)/);    // #(YYYY-MM-DD)
  const mImg  = t.match(/#img\(([^)]+)\)/i);           // #img(URL)
  const mLink = t.match(/#link\(([^)]+)\)/i);          // #link(URL)
  return {
    date:  mDate ? mDate[1] : '',
    image: mImg  ? mImg[1]  : '',
    link:  mLink ? mLink[1] : ''
  };
}

function buildNotifUrl(title, body, extra){
  const q = new URLSearchParams({
    title: String(title || 'Notificación'),
    body:  String(body  || ''),
    date:  extra?.date  || '',
    image: extra?.image || '',
    link:  extra?.link  || ''
  });
  return '/#/notif?' + q.toString();
}

// Mensajes en background
messaging.onBackgroundMessage(async (payload) => {
  // Normaliza para soportar payload.notification y payload.data
  const d  = payload?.data || {};
  const pn = payload?.notification || {};

  // Título / body: prioridad a data, luego notification
  const title = (d.title || pn.title || 'Notificación');
  const body  = (d.body  || pn.body  || '');

  // Extrae patrones del body si no llegan como claves separadas
  const found = extractPatterns(body);
  const meta = {
    date:  d.date  || found.date  || '',
    image: d.image || found.image || '',
    link:  d.link  || found.link  || ''
  };

  // URL destino
  const url = d.url || buildNotifUrl(title, body, meta);
  const msgId = payload?.messageId || d.id || '';

  // ✅ SIEMPRE avisar a la app (si está abierta) para que la campanita la guarde
  await broadcastToClients({
    type: 'notif:new',
    payload: {
      id: msgId,
      title,
      body,
      date:  meta.date,
      image: meta.image,
      link:  meta.link,
      ts: Date.now()
    }
  });

  /**
   * Mostrar notificación:
   * - Si viene "notification" a veces el navegador la muestra automáticamente.
   * - Pero en PWA/web eso no siempre es consistente, así que:
   *   ✅ Si el servidor manda DATA-only, mostramos nosotros.
   *   ✅ Si el servidor manda notification+data, intentamos NO duplicar.
   *
   * Puedes forzar mostrar siempre pasando d.forceShow="1" (string).
   */
  const forceShow = String(d.forceShow || '') === '1';

  // Si viene notification y NO es forzado, evitamos duplicado
  const hasNotification = !!payload?.notification;
  if (hasNotification && !forceShow) return;

  // Data message (o forzado): mostramos la notificación nosotros
  const uniqTag = d.tag || msgId || ('pipjm-' + Date.now() + '-' + Math.random().toString(36).slice(2,8));
  const options = {
    body,
    icon:  d.icon  || DEFAULT_ICON,
    badge: d.badge || DEFAULT_BADGE,
    image: meta.image || undefined,

    // tag ayuda a agrupar / evitar spam si llega lo mismo repetido
    // Si tu server manda d.tag úsalo, si no, usa una por defecto.
    tag: uniqTag,
    renotify: false,

    data: {
      title,
      body,
      date:  meta.date,
      image: meta.image,
      link:  meta.link,
      url
    }
  };

  return self.registration.showNotification(title, options);
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

      // Navegar si hace falta
      const needNav = !client.url.includes(targetUrl);
      if (needNav && 'navigate' in client) {
        try { await client.navigate(targetUrl); } catch(e) {}
      }

      // Enfocar
      try { await client.focus(); } catch(e) {}

      // ✅ Marcar/avisar: se abrió desde push (para bandeja/badge)
      try { client.postMessage({ type: 'notif:open', url: targetUrl }); } catch(e) {}

      // Mantener tu señal actual por si tu app usa "go"
      try { client.postMessage({ type: 'go', url: targetUrl }); } catch(e) {}

      return;
    }

    // Si no hay ventanas, abrir una nueva
    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl);
    }
  })());
});
