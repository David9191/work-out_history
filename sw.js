// 앱 파일을 캐시해 즉시 열고, 뒤에서 최신 버전을 받아둔다 (다음 실행에 반영).
const CACHE = 'app-v3';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request);
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    return hit ? (net.catch(() => {}), hit) : net;
  }));
});
