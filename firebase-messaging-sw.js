/* eslint-disable no-undef */
/* === Firebase Messaging SW === */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

/* Toma control rápido */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

/* Config de tu proyecto */
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});

const messaging = firebase.messaging();

/* Iconos por defecto (Android) */
const DEFAULT_ICON  = "icons/icon-192.png";
const DEFAULT_BADGE = "icons/icon-72.png";

/* Utils */
const ORIGIN = self.location.origin;
const APP_BASE = self.registration.scope || ORIGIN + '/';

function encode(s){ return encodeURIComponent(String(s || '')); }

function extractISODateFromText(text){
  // Acepta 25/09/2025, 25-09-2025 o 2025-09-25 -> devuelve YYYY-MM-DD o ''
  const s = String(text || '');
  const dmy = s.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/); // 25/09/2025
  if (dmy){
    const [, d, m, y] = dmy;
    return `${y}-${m}-${d}`;
  }
  const ymd = s.match(/(\d{4})-(\d{2})-(\d{2})/); // 2025-09-25
  if (ymd){
    const [, y, m, d] = ymd;
    return `${y}-${m}-${d}`;
  }
  return '';
}

function buildNotifUrl({ title, body, date, target }){
  // target (opcional) es a dónde quieres aterrizar si NO usas hoja (seguimos usando la hoja)
  const params = new URLSearchParams();
  params.set('notif', '1');
  if (title) params.set('title', title);
  if (body)  params.set('body',  body);
  if (date)  params.set('date',  date);
  const hash = '#' + params.toString();
  // Siempre apuntamos a la raíz de la PWA: tu app.js se encarga del overlay
  return APP_BASE + hash;
}

/* Mensajes en background (DATA) */
messaging.onBackgroundMessage((payload) => {
  // Si llega payload.notification, dejamos que el browser la muestre (evita duplicado)
  // PERO añadimos data.url para que notificationclick sepa a dónde ir
  if (payload?.notification) {
    const n = payload.notification;
    const d = payload.data || {};

    const title = d.title || n.title || 'Notificación';
    const body  = d.body  || n.body  || '';
    const iso   = d.date  || extractISODateFromText(body);

    // Guardamos la URL con hash en data para usarla en el click
    payload.fcmOptions = payload.fcmOptions || {};
    const url = buildNotifUrl({
      title: encode(title),
      body:  encode(body),
      date:  iso ? encode(iso) : ''
    });

    // No mostramos nosotros; el navegador ya la mostrará.
    // Pero "pasamos" la url por data para recuperarla en el click handler.
    self.__lastFallbackUrl = url; // respaldo por si el data no viaja completo
    return;
  }

  // DATA pura: mostramos nosotros con defaults y ponemos data.url
  const d = payload?.data || {};
  const title = d.title || 'Notificación';
  const body  = d.body  || '';
  const iso   = d.date  || extractISODateFromText(body);

  const url = buildNotifUrl({
    title: encode(title),
    body:  encode(body),
    date:  iso ? encode(iso) : ''
  });

  const options = {
    body,
    icon: d.icon || DEFAULT_ICON,
    badge: d.badge || DEFAULT_BADGE,
    image: d.image || undefined,
    data: { url },
    tag: d.tag || undefined,          // opcional: agrupa/replace
    renotify: false,                  // evita vibrar si replace
  };

  self.registration.showNotification(title, options);
});

/* Click en notificación: abrir/enfocar con nuestro hash */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // url que guardamos en data (si no, usa respaldo o base)
  const targetUrl =
    (event.notification.data && event.notification.data.url) ||
    self.__lastFallbackUrl ||
    APP_BASE;

  event.waitUntil((async () => {
    // Intentar enfocar una pestaña de la PWA
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all){
      if ('focus' in c) {
        // Si ya está abierta, dirige a la URL con hash
        try { await c.navigate(targetUrl); } catch(_) {}
        return c.focus();
      }
    }
    // Si no hay ninguna, abre una nueva
    if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
  })());
});