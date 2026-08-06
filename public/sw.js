const CACHE = 'atlas-static-v2';
const SAFE = ['/offline', '/manifest.webmanifest', '/icons/atlas.svg', '/icons/atlas-maskable.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SAFE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase') || request.headers.get('authorization')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match('/offline')));
    return;
  }
  if (SAFE.includes(url.pathname)) event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
