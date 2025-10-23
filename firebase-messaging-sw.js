/* eslint-disable no-undef */
/* === Firebase Messaging Service Worker (PWA) ================================
   - Muestra la notificación (data-only y notification payload)
   - Guarda un registro en IndexedDB (aunque la PWA no esté abierta)
   - Al tocar la push abre/focus la PWA con el overlay (#/notif?...).
   - Cuando hay clientes abiertos, también les manda postMessage (notif:new)
   - Soporta sync: el cliente puede pedir "notif:pull" y se le devuelven todas.
============================================================================= */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

/* --- Control SW rápido --- */
self.addEventListener('install', (e)=> self.skipWaiting());
self.addEventListener('activate', (e)=> e.waitUntil(self.clients.claim()));

/* --- Tu proyecto (el mismo del app.js/config.js) --- */
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});
const messaging = firebase.messaging();

/* --- Iconos por defecto (rutas de tu PWA) --- */
const DEFAULT_ICON  = "icons/icon-192.png";
const DEFAULT_BADGE = "icons/icon-72.png";

/* ============================================================================
   IndexedDB (en el SW) para guardar notificaciones aunque la app esté cerrada
============================================================================ */
const DB_NAME = 'app-notifs';
const DB_STORE = 'notifs';
const DB_VER = 1;

function idbOpen(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (ev)=>{
      const db = ev.target.result;
      if(!db.objectStoreNames.contains(DB_STORE)){
        const store = db.createObjectStore(DB_STORE, { keyPath: 'id' });
        store.createIndex('ts','ts',{unique:false});
        store.createIndex('read','read',{unique:false});
      }
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror   = ()=>reject(req.error);
  });
}
async function dbAdd(item){
  const db = await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(DB_STORE,'readwrite');
    tx.oncomplete = ()=>resolve(true);
    tx.onerror    = ()=>reject(tx.error);
    tx.objectStore(DB_STORE).put(item); // put = upsert
  });
}
async function dbGetAll(){
  const db = await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(DB_STORE,'readonly');
    const req = tx.objectStore(DB_STORE).getAll();
    req.onsuccess = ()=>resolve(req.result||[]);
    req.onerror   = ()=>reject(req.error);
  });
}
async function dbMarkReadByContent(title, body){
  const db = await idbOpen();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(DB_STORE,'readwrite');
    const store = tx.objectStore(DB_STORE);
    const all = store.getAll();
    all.onsuccess = ()=>{
      const list = all.result||[];
      list.forEach(n=>{
        if(!n.read && n.title===title && n.body===body){
          n.read = true; store.put(n);
        }
      });
    };
    tx.oncomplete = ()=>resolve(true);
    tx.onerror    = ()=>reject(tx.error);
  });
}

/* ============================================================================
   Utilidades de payload y URLs
============================================================================ */
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
function makeInboxPayload({title, body, date, image, link}){
  return {
    id: (Date.now()+'-'+Math.random().toString(36).slice(2,8)),
    ts: Date.now(),
    title: String(title || 'Notificación').slice(0,140),
    body:  String(body || ''),
    date:  date  || '',
    image: image || '',
    link:  link  || '',
    read:  false
  };
}

/* --- Avisar a los clientes (si hay) --- */
async function broadcastToClients(msg){
  try{
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    cs.forEach(c=>{ try{ c.postMessage(msg); }catch(_){ } });
  }catch(_){}
}

/* ============================================================================
   Handler principal: background messages FCM
============================================================================ */
messaging.onBackgroundMessage(async (payload) => {
  const data  = payload?.data || {};
  const notif = payload?.notification || null;

  let title, body, meta = {};
  if (notif) {
    // Mensaje con "notification" (Chrome lo muestra igual).
    title = notif.title || 'Notificación';
    body  = notif.body  || '';
    const found = extractPatterns(body);
    meta = {
      date:  data.date  || found.date  || '',
      image: data.image || found.image || '',
      link:  data.link  || found.link  || ''
    };
  } else {
    // Data-only → debemos mostrar nosotros
    title = data.title || 'Notificación';
    body  = data.body  || '';
    const found = extractPatterns(body);
    meta = {
      date:  data.date  || found.date  || '',
      image: data.image || found.image || '',
      link:  data.link  || found.link  || ''
    };
  }

  const url = data.url || buildNotifUrl(title, body, meta);

  // 1) Guardar en IndexedDB (la campana lo podrá leer luego)
  const item = makeInboxPayload({ title, body, date: meta.date, image: meta.image, link: meta.link });
  try{ await dbAdd(item); }catch(_){}

  // 2) Si hay clientes abiertos, avisar (la campana sube de inmediato)
  broadcastToClients({ type: 'notif:new', payload: {
    title: item.title, body: item.body, date: item.date, image: item.image, link: item.link
  }});

  // 3) Mostrar la notificación del sistema (si es data-only o forzar para coherencia)
  //    Para evitar duplicado en algunos Chrome/Android, usamos `tag` + `renotify:false`
  const options = {
    body,
    icon:  data.icon  || DEFAULT_ICON,
    badge: data.badge || DEFAULT_BADGE,
    image: meta.image || undefined,
    vibrate: [200, 100, 200],
    tag: 'pipjm-notif',          // misma tag evita duplicados seguidos
    renotify: false,
    data: { title, body, date: meta.date, image: meta.image, link: meta.link, url }
  };

  // Si el mensaje YA traía notification, Chrome lo muestra aunque no llamemos showNotification.
  // Aun así, para unificar (y cubrir iOS/otros browsers), invocamos showNotification de forma segura.
  try{ await self.registration.showNotification(title, options); }catch(_){}
});

/* ============================================================================
   Click en la notificación → abrir/focus la PWA y marcar leída
============================================================================ */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const d = event.notification?.data || {};
  const targetUrl = d.url || buildNotifUrl(d.title||'Notificación', d.body||'', d);

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type:'window', includeUncontrolled:true });
    // Probar reusar una ventana existente controlada por este SW
    for (const c of all){
      try{
        // Navega si no tiene el hash correcto
        if (!c.url.includes(targetUrl) && 'navigate' in c) {
          await c.navigate(targetUrl);
        }
        await c.focus();
        // marcar como leída por contenido (mejor matching)
        await dbMarkReadByContent(d.title||'', d.body||'');
        // avisar al front
        broadcastToClients({ type:'notif:open', url: targetUrl });
        return;
      }catch(_){}
    }
    // Si no hay ventanas, abrir una nueva dentro del scope del SW
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
      // Intentar marcar y avisar
      try{ await dbMarkReadByContent(d.title||'', d.body||''); }catch(_){}
      setTimeout(()=>broadcastToClients({ type:'notif:open', url: targetUrl }), 500);
    }
  })());
});

/* ============================================================================
   Canal de mensajes SW <-> PWA
   - La app puede pedir "notif:pull" para sincronizar las guardadas OFFLINE
============================================================================ */
self.addEventListener('message', (event)=>{
  const msg = event.data || {};
  if (msg && msg.type === 'notif:pull'){
    event.waitUntil((async ()=>{
      try{
        const list = await dbGetAll();
        // ordenar por fecha desc
        list.sort((a,b)=>b.ts-a.ts);
        event.source?.postMessage({ type:'notif:list', items:list });
      }catch(_){
        event.source?.postMessage({ type:'notif:list', items:[] });
      }
    })());
  }
});
