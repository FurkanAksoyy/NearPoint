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

// Web push: show the notification
self.addEventListener('push', (event) => {
    let data = { title: 'NearPoint', body: 'Discover places near you.', url: '/' };
    try { if (event.data) data = { ...data, ...event.data.json() }; } catch (e) { /* keep defaults */ }
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url: data.url || '/' },
        })
    );
});

// Focus/open the app when a notification is clicked
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
            for (const client of list) {
                if ('focus' in client) return client.focus();
            }
            return self.clients.openWindow(url);
        })
    );
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
