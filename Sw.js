const CACHE_NAME = 'learnhub-v2';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install — cache all files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache first, fallback to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache new requests dynamically
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, response.clone());
          return response;
        });
      }).catch(() => {
        // If offline and not cached, return the main app
        return caches.match('./index.html');
      });
    })
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
