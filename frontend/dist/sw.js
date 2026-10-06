// Service Worker — CampusNav Offline Support
// Caches OSM map tiles and app shell for offline use

const TILE_CACHE  = 'campusnav-tiles-v2';
const APP_CACHE   = 'campusnav-app-v2';
const TILE_REGEX  = /tile\.openstreetmap\.org/;

// Cache app shell on install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(APP_CACHE).then(c =>
      c.addAll(['/', '/index.html']).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== TILE_CACHE && k !== APP_CACHE)
        .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Cache-first for OSM tiles (offline map)
  if (TILE_REGEX.test(url)) {
    e.respondWith(
      caches.open(TILE_CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          // Return transparent 256x256 PNG tile when fully offline
          return new Response(
            atob('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEXo6+22AABdSklEQVR42mNkYGBg'),
            { headers: { 'Content-Type': 'image/png' } }
          );
        }
      })
    );
    return;
  }

  // Network-first for API calls
  if (url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(e.request)
      )
    );
    return;
  }

  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
