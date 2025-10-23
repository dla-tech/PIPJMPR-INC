/* eslint-disable no-undef */
/* === Service Worker principal: solo caché (independiente del de FCM) === */

const CACHE = 'app-v4';
const PRECACHE_URLS = [
  './index.html',
  './config/config.js',
  './config/theme.css',
  './app.js',
  './manifest.json'
];

// Instalar y cachear archivos base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting(); // activar sin esperar recarga
});

// Activar y limpiar versiones viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Navegación offline (páginas)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Solo GET (para evitar interferir con POST/PUT)
  if (req.method !== 'GET') return;

  // Respuesta caché-primero con fallback a red
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return resp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
