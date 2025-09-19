/* eslint-disable no-undef */
// === Service Worker para Firebase Cloud Messaging (FCM) ===
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Tomar control lo antes posible
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

// Iconos por defecto
const DEFAULT_ICON  = "icons/icon-192.png";
const DEFAULT_BADGE = "icons/icon-72.png";

// --- Helper: avisar a las ventanas (PWA) ---
async function broadcastToClients(msg){
  try{
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) { try { c.postMessage(msg); } catch(_){} }
  }catch(_){}
}

// --- Helpers: extraer patrones del body y construir URL de overlay ---
function extractPatterns(text){
  const t = String(text || '');
  const mDate = t.match(/#\((\d{4}-\d{2}-\d{2})\)/);   // #(YYYY-MM-DD)
  const mImg  = t.match(/#img\(([^)]+)\)/i);          // #img(URL)
  const mLink = t.match(/#link\(([^)]+)\)/i);         // #link(URL)
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

// --- Util: construir payload “ligero” para la bandeja interna ---
function makeInboxPayload({title, body, date, image, link}){
  return {
    // id y ts también los puede generar el front; aquí enviamos datos mínimos
    title: String(title || 'Notificación').slice(0,140),
    body:  String(body || ''),
    date:  date  || '',
    image: image || '',
    link:  link  || ''
  };
}

// --- Mensajes en background ---
messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const notif = payload?.notification || null;

  if (notif) {
    // Notificación “clásica” enviada por FCM (dejamos que el navegador la muestre).
    const title = notif.title || 'Notificación';
    const body  = notif.body  || '';
    const found = extractPatterns(body);

    const meta = {
      date:  data.date  || found.date  || '',
      image: data.image || found.image || '',
      link:  data.link  || found.link  || ''
    };
    const url  = data.url || buildNotifUrl(title, body, meta);

    // Avisar al front para que la guarde en la bandeja
    broadcastToClients({
      type: 'notif:new',
      payload: makeInboxPayload({ title, body, date: meta.date, image: meta.image, link: meta.link })
    });

    // No hacemos showNotification para evitar duplicados.
    return;
  }

  // Data-only: el SW debe crear la notificación
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
    data: {
      title,
      body,
      date:  meta.date,
      image: meta.image,
      link:  meta.link,
      url
    }
  };

  // Mostrar notificación del sistema
  self.registration.showNotification(title, options);

  // Avisar al front para que registre en la bandeja
  broadcastToClients({
    type: 'notif:new',
    payload: makeInboxPayload({ title, body, date: meta.date, image: meta.image, link: meta.link })
  });
});

// --- Click en la notificación ---
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
      // Navegar si la URL/fragment no coincide
      try {
        const needNav = !client.url.includes(targetUrl);
        if (needNav && 'navigate' in client) {
          await client.navigate(targetUrl);
        }
        await client.focus();
      } catch(_) {}

      // Avisar al front: marcar como leída en la bandeja
      broadcastToClients({ type: 'notif:open', url: targetUrl });
      return;
    }

    // Si no hay ventana, abre una nueva
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
      // Intentar avisar después de un breve tiempo (puede no llegar si no carga la app aún)
      setTimeout(()=>broadcastToClients({ type: 'notif:open', url: targetUrl }), 500);
    }
  })());
});