const CACHE_NAME = 'farm-nex-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Always network-first to avoid serving stale builds on localhost
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
