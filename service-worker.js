const CACHE = 'app-v3';
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // Solo manejar GET para cachear
  if (req.method !== 'GET') return;  // deja pasar otras (POST/PUT/etc.)

  event.respondWith(
    fetch(req)
      .then((resp) => {
        // cachear solo respuestas exitosas
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(req))
  );
});
