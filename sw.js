/* ChaloYaar service worker — cache-first app shell. Never intercept cross-origin APIs. */
const CACHE = "chaloyaar-v24";
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./data.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/logo-mark.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never intercept cross-origin API calls (Gemini, Open-Meteo, Nominatim, etc.)
  if (url.origin !== self.location.origin) {
    if (
      url.hostname === "fonts.googleapis.com" ||
      url.hostname === "fonts.gstatic.com"
    ) {
      event.respondWith(staleWhileRevalidate(req));
    }
    return;
  }

  // Never cache API / functions — always network
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/.netlify/functions/")
  ) {
    return;
  }

  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req, { ignoreSearch: true });
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok && req.method === "GET") {
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone());
    }
    return res;
  } catch (_) {
    if (req.mode === "navigate") {
      const fallback = await caches.match("./index.html");
      if (fallback) return fallback;
    }
    throw _;
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}
