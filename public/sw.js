/**
 * Service worker — Day 51 Workbox precache + runtime caching, plus the
 * Day 38 push-notification handlers.
 *
 * Loaded via importScripts from the Workbox CDN rather than a bundled
 * `injectManifest` build step: this project builds with Turbopack, and
 * workbox-webpack-plugin (what `next-pwa` and friends use under the
 * hood) is a webpack-only plugin with no Turbopack equivalent yet. A
 * service worker is just a static file the browser fetches directly, so
 * it never goes through Turbopack anyway — this file works with either
 * bundler. The trade-off: Workbox's own runtime is fetched from a CDN at
 * SW-install time (cached after that), rather than bundled locally.
 */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

const VERSION = 'v1';

if (self.workbox) {
  workbox.core.setCacheNameDetails({ prefix: 'elevanda-chms', suffix: VERSION });
  workbox.core.clientsClaim();

  // ── Precache the app shell ─────────────────────────────────────────────
  // Next.js hashes its JS/CSS bundle filenames per build, so an exact
  // precache manifest needs build-time integration (injectManifest) that
  // Turbopack doesn't support yet — see the file header. What CAN be
  // precached safely is the small set of assets with stable URLs; the
  // hashed `/_next/static/*` bundles are handled by the StaleWhileRevalidate
  // runtime route below instead, which is the standard fallback approach.
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: VERSION },
    { url: '/manifest.json', revision: VERSION },
    { url: '/favicon.svg', revision: VERSION },
    { url: '/offline.html', revision: VERSION },
  ]);

  // ── Runtime caching strategies (Day 51 Task 1) ─────────────────────────

  // Images — CacheFirst: they rarely change once uploaded, so a cache hit
  // skips the network entirely after the first load.
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  );

  // Next.js static build assets (hashed JS/CSS/fonts) — StaleWhileRevalidate:
  // serve the cached version instantly, refresh it in the background.
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/_next/static/'),
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'next-static-assets' }),
  );

  // API responses — NetworkFirst with a 5s timeout: prefer live data, but
  // fall back to the last cached response instead of hanging when the
  // network is slow/unreachable (Day 55: Slow-3G resilience).
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/communication/whatsapp'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-responses',
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new workbox.expiration.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }),
      ],
    }),
  );

  // Page navigations — NetworkFirst, falling back to a friendly offline
  // page when there's no cached copy of the requested route yet.
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages',
      networkTimeoutSeconds: 5,
      plugins: [{
        handlerDidError: async () => caches.match('/offline.html'),
      }],
    }),
  );
} else {
  console.warn('[sw.js] Workbox failed to load from the CDN — falling back to network-only (no offline caching this session).');
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Client (registerServiceWorker in lib/push.ts) posts this after the user
// clicks "Reload" on the update-available toast — see Day 51 Task 2.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// ── Push notifications (Day 38) ─────────────────────────────────────────

self.addEventListener('push', (event) => {
  let payload = { title: 'Elevanda ChMS', body: 'You have a new notification.', url: '/dashboard' };
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() }; } catch { /* plain-text push — use defaults */ }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      data: { url: payload.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
