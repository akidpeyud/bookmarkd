// BOOKMARKD Progressive Web App Service Worker
// Version 3: Enforces zero-cache on private authenticated routes and eliminates cross-account cache leakage
const CACHE_NAME = "bookmarkd-v3";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon.svg",
  "/favicon.ico",
  "/offline",
];

const PRIVATE_ROUTES = [
  "/library",
  "/settings",
  "/notifications",
  "/profile",
  "/auth",
];

// Install: pre-cache application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Pre-cache partial warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up outdated caches
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

// Fetch: stale-while-revalidate for static assets, network-first for navigation
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip chrome-extension, API calls, and external non-static requests
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  const isPrivateRoute = PRIVATE_ROUTES.some(
    (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
  );

  // Navigation requests (HTML pages)
  if (request.mode === "navigate") {
    // If it's a private or auth route, NEVER cache in service worker
    if (isPrivateRoute) {
      event.respondWith(
        fetch(request).catch(async () => {
          const offlinePage = await caches.match("/offline");
          return (
            offlinePage ||
            new Response("Bookmarkd Offline Reader - Authentication required", {
              status: 503,
              headers: { "Content-Type": "text/html" },
            })
          );
        })
      );
      return;
    }

    // Public navigation pages (Home, Discover, etc.): Network-first with cache fallback
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match("/");
          return fallback || new Response("Bookmarkd Offline Reader", { status: 503 });
        })
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts, Images): Cache-first with network fallback
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
