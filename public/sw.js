/**
 * Anime Tracker — Service Worker
 *
 * Strategie:
 * - Assets (CSS/JS/Icons) → Cache-First (ewig, da Hash-URLs)
 * - HTML/Pages → Network-First (aktuell, Fallback Cache)
 * - AniList API → Network-Only (nie cachen)
 * - Alles andere → Network-First
 */

const CACHE = 'anime-tracker-v2';
const STATIC_CACHE = 'anime-tracker-static-v2';
const BASE = '/anime-tracker';

const STATIC_URLS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/favicon.svg`,
  `${BASE}/icons/icon-192.svg`,
  `${BASE}/icons/icon-512.svg`,
];

/** Assets mit Hash im Namen → ewig cachebar */
function isHashAsset(url) {
  return /\/assets\/[^/]+\.[a-f0-9]{8}\./.test(url.pathname);
}

/** AniList API → nie cachen */
function isAnilistApi(url) {
  return url.hostname === 'graphql.anilist.co';
}

/** Statische Dateien (Icons, Manifest, Favicon) */
function isStaticFile(url) {
  return STATIC_URLS.some(p => url.pathname === p) ||
         /\.(svg|ico|json|png|webp)$/.test(url.pathname);
}

// ─── Install ───────────────────────────────────────────────────────────

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(STATIC_URLS);
  })());
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Alte Caches löschen
    const keys = await caches.keys();
    await Promise.all(
      keys.map(k => {
        if (k !== CACHE && k !== STATIC_CACHE) return caches.delete(k);
      })
    );
    await clients.claim();
  })());
});

// ─── Fetch ─────────────────────────────────────────────────────────────

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // AniList API → nie cachen
  if (isAnilistApi(url)) {
    e.respondWith(fetch(e.request).catch(() => new Response(
      JSON.stringify({ error: 'offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )));
    return;
  }

  // Assets mit Hash → Cache-First (für immer)
  if (isHashAsset(url)) {
    e.respondWith(cacheFirst(e.request));
    return;
  }

  // Statische Dateien → Cache-First
  if (isStaticFile(url)) {
    e.respondWith(cacheFirst(e.request));
    return;
  }

  // HTML/Seiten → Network-First
  if (url.pathname.startsWith(BASE) || url.pathname === '/') {
    e.respondWith(networkFirst(e.request));
    return;
  }

  // Alles andere → Network-First
  e.respondWith(networkFirst(e.request));
});

// ─── Strategien ────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback: Minimal-HTML für Navigation
    if (request.mode === 'navigate') {
      return new Response(
        '<!doctype html><html><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Anime Tracker — Offline</title>' +
        '<style>body{background:#0F0F23;color:#E2E8F0;font-family:sans-serif;' +
        'display:flex;justify-content:center;align-items:center;min-height:100vh;' +
        'text-align:center;padding:20px}' +
        'h1{color:#7C3AED}div{max-width:400px}</style>' +
        '<body><div><h1>📴 Offline</h1>' +
        '<p>Der Anime Tracker ist offline.<br>Bitte verbinde dich mit dem Internet.</p>' +
        '</div></body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html;charset=utf-8' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }
}
