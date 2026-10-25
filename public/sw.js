// Altara Field Ops Service Worker
const CACHE_NAME = "altara-field-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

// Install: Cache critical shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy depending on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only cache GET requests (do not intercept POST/mutations)
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Strategy 1: Static assets & Next.js chunks (Stale-While-Revalidate)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy 2: Page navigation & Field Ops data (Network-First with Cache Fallback)
  // This guarantees freshest live data when online, but full offline fallback in ballrooms/basements.
  event.respondWith(
    fetch(request)
      .then(async (networkResponse) => {
        if (networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If it's a page navigation and not in cache, fallback to root shell
        if (request.mode === "navigate") {
          return caches.match("/");
        }

        return new Response("Koneksi internet terputus (Offline)", {
          status: 503,
          statusText: "Offline",
          headers: new Headers({ "Content-Type": "text/plain" }),
        });
      })
  );
});
