/* eslint-disable no-undef */
/* === Firebase Messaging Service Worker (PWA) ================================
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

/* --- Control SW rápido --- */
self.addEventListener('install', (e)=> self.skipWaiting());
self.addEventListener('activate', (e)=> e.waitUntil(self.clients.claim()));

/* --- Tu proyecto Firebase --- */
firebase.initializeApp({
  apiKey: "AIzaSyAHQjMp8y9uaxAd0nnmCcVaXWSbij3cvEo",
  authDomain: "miappiglesia-c703a.firebaseapp.com",
  projectId: "miappiglesia-c703a",
  storageBucket: "miappiglesia-c703a.appspot.com",
  messagingSenderId: "501538616252",
  appId: "1:501538616252:web:d6ead88050c4dd7b09b1b9"
});
const messaging = firebase.messaging();

/* --- Iconos por defecto --- */
const DEFAULT_ICON  = "icons/icon-192.png";
const DEFAULT_BADGE = "icons/icon-72.png";

/* ============================================================================
   IndexedDB para guardar notificaciones
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
    tx.objectStore(DB_STORE).put(item);
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
   Utilidades
============================================================================ */
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
    title = notif.title || 'Notificación';
    body  = notif.body  || '';
    const found = extractPatterns(body);
    meta = {
      date:  data.date  || found.date  || '',
      image: data.image || found.image || '',
      link:  data.link  || found.link  || ''
    };
  } else {
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
  const item = makeInboxPayload({ title, body, date: meta.date, image: meta.image, link: meta.link });

  // Guardar en IndexedDB
  try{ await dbAdd(item); }catch(_){}

  // Notificar a las ventanas abiertas (PWA)
  broadcastToClients({ type: 'notif:new', payload: item });

  // Mostrar notificación del sistema SOLO si no la mostró FCM (data-only)
  if (!notif) {
    const options = {
      body,
      icon:  data.icon  || DEFAULT_ICON,
      badge: data.badge || DEFAULT_BADGE,
      image: meta.image || undefined,
      vibrate: [200, 100, 200],
      tag: 'pipjm-notif',
      renotify: false,
      data: { title, body, date: meta.date, image: meta.image, link: meta.link, url }
    };
    try{ await self.registration.showNotification(title, options); }catch(_){}
  }
});

/* ============================================================================
   Click en la notificación
============================================================================ */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const d = event.notification?.data || {};
  const targetUrl = d.url || buildNotifUrl(d.title||'Notificación', d.body||'', d);

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type:'window', includeUncontrolled:true });
    for (const c of all){
      try{
        if (!c.url.includes(targetUrl) && 'navigate' in c) {
          await c.navigate(targetUrl);
        }
        await c.focus();
        await dbMarkReadByContent(d.title||'', d.body||'');
        broadcastToClients({ type:'notif:open', url: targetUrl });
        return;
      }catch(_){}
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
      try{ await dbMarkReadByContent(d.title||'', d.body||''); }catch(_){}
      setTimeout(()=>broadcastToClients({ type:'notif:open', url: targetUrl }), 500);
    }
  })());
});

/* ============================================================================
   Canal de mensajes SW <-> PWA
============================================================================ */
self.addEventListener('message', (event)=>{
  const msg = event.data || {};
  if (msg && msg.type === 'notif:pull'){
    event.waitUntil((async ()=>{
      try{
        const list = await dbGetAll();
        list.sort((a,b)=>b.ts-a.ts);
        event.source?.postMessage({ type:'notif:list', items:list });
      }catch(_){
        event.source?.postMessage({ type:'notif:list', items:[] });
      }
    })());
  }
});
