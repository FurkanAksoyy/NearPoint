/* NearPoint service worker: offline app shell + runtime caching of same-origin assets.
   API calls (different origin) and Google requests are never cached. */
const CACHE = 'nearpoint-v1';
const SHELL = ['/', '/index.html', '/manifest.json', '/logo.svg', '/icon.svg'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    // Only handle same-origin (skip backend API + Google + tiles)
    if (url.origin !== self.location.origin) return;

    // Navigations: network-first, fall back to cached shell when offline
    if (req.mode === 'navigate') {
        event.respondWith(fetch(req).catch(() => caches.match('/index.html').then((r) => r || caches.match('/'))));
        return;
    }

    // Static assets: cache-first with runtime caching
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put(req, copy));
                }
                return res;
            });
        })
    );
});
