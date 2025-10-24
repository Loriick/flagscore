// Service Worker pour la mise en cache des ressources
const STATIC_CACHE_NAME = "flagscore-static-v1";
const DYNAMIC_CACHE_NAME = "flagscore-dynamic-v1";

// Ressources à mettre en cache statiquement
const STATIC_ASSETS = [
  "/",
  "/404.png",
  "/flagscore-logo-removebg-preview.png",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
];

// Installer le service worker
self.addEventListener("install", event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting(),
    ])
  );
});

// Activer le service worker
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            ) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

// Intercepter les requêtes
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Stratégie de cache selon le type de ressource
  if (request.method === "GET") {
    if (isStaticAsset(url.pathname)) {
      // Cache First pour les assets statiques
      event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    } else if (isDynamicAsset(url.pathname)) {
      // Stale While Revalidate pour les assets dynamiques
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
    } else if (isApiRequest(url.pathname)) {
      // Network First pour les API
      event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
    }
  }
});

// Stratégie Cache First
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Retourner une page d'erreur si disponible
    const errorResponse = await caches.match("/404.png");
    return errorResponse || new Response("Offline", { status: 503 });
  }
}

// Stratégie Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Stratégie Network First
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response("Offline", { status: 503 });
  }
}

// Vérifier si c'est un asset statique
function isStaticAsset(pathname) {
  return (
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".ttf") ||
    pathname.endsWith(".eot")
  );
}

// Vérifier si c'est un asset dynamique
function isDynamicAsset(pathname) {
  return pathname.startsWith("/_next/");
}

// Vérifier si c'est une requête API
function isApiRequest(pathname) {
  return pathname.startsWith("/api/");
}

// Message handler pour la communication avec l'app
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});
