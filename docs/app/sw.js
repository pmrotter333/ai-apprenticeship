/* ============================================================
   Hora — Service Worker
   Cache-first strategy for app shell and static assets.
   Network-first for cross-origin AI API calls.
   ============================================================ */

const CACHE_NAME = 'hora-v23';

const APP_SHELL = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './db.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './libs/dexie.min.js',
  './libs/alpine.min.js',
  './libs/purify.min.js',
  './libs/marked.min.js',
  './stages/stage1.js',
  './stages/stage2.js',
  './stages/stage3.js',
  './stages/stage4.js',
  './stages/stage5.js',
  '../shared/style.css',
  '../shared/toolkit.js',
  '../shared/assets/fonts/dm-sans-variable.woff2',
  '../shared/assets/fonts/dm-sans-variable-italic.woff2',
  '../shared/assets/fonts/newsreader-variable.woff2',
  '../shared/assets/fonts/newsreader-variable-italic.woff2',
];

/* Install: cache the app shell. Do NOT call skipWaiting() so we can show
   an "Update available" banner before activating. */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

/* Activate: clear old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* Message: allow the app to trigger skipWaiting when user clicks "Refresh" */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* Fetch: cache-first for app shell, network-first for AI APIs */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Pass through AI API calls — never cache.
     If a new AI provider is added, its hostname must be listed here. */
  if (url.hostname === 'api.anthropic.com'
      || url.hostname === 'api.openai.com'
      || url.hostname === 'generativelanguage.googleapis.com') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        /* Only cache valid same-origin or explicitly listed responses */
        if (!response || response.status !== 200) return response;

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      }).catch(() => {
        /* Offline fallback for navigation requests */
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        /* Return empty 408 so the browser gets a defined response instead of undefined,
           which would cause silent broken UI (missing fonts, icons, etc.) */
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});
