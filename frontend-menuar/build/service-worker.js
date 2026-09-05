const CACHE_NAME = 'restaurant-ar-v2';
const urlsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  // Borrar caches de versiones anteriores (ej. restaurant-ar-v1) para que
  // nunca se siga sirviendo un bundle.js viejo desde el navegador.
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // No cachear el JS/CSS con hash de build: siempre ir a red primero
  // para no volver a quedar pegados con una versión vieja del código.
  if (event.request.url.includes('/static/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request);
    })
  );
});