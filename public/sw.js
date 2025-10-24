// Service Worker for caching resources
const STATIC_CACHE_NAME = "flagscore-static-v1";
const DYNAMIC_CACHE_NAME = "flagscore-dynamic-v1";

// Utility function to safely clone a response
function safeCloneResponse(response) {
  try {
    return response.clone();
  } catch (error) {
    console.warn("Unable to clone response:", error);
    return null;
  }
}

// Resources to cache statically
const STATIC_ASSETS = ["/", "/404.png", "/flagscore-logo-removebg-preview.png"];

// Install service worker
self.addEventListener("install", event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(error => {
          console.warn("Error during caching:", error);
          // Continue even if some files cannot be cached
          return Promise.resolve();
        });
      }),
      self.skipWaiting(),
    ])
  );
});

// Activate service worker
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
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

// Intercept requests
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-HTTP requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Cache strategy based on resource type
  if (request.method === "GET") {
    if (isStaticAsset(url.pathname)) {
      // Cache First for static assets
      event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    } else if (isDynamicAsset(url.pathname)) {
      // Stale While Revalidate for dynamic assets
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
    } else if (isApiRequest(url.pathname)) {
      // Network First for APIs
      event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
    }
  }
});

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const clonedResponse = safeCloneResponse(networkResponse);
      if (clonedResponse) {
        await cache.put(request, clonedResponse);
      }
    }
    return networkResponse;
  } catch {
    // Return error page if available
    const errorResponse = await caches.match("/404.png");
    return errorResponse || new Response("Offline", { status: 503 });
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then(async networkResponse => {
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const clonedResponse = safeCloneResponse(networkResponse);
      if (clonedResponse) {
        await cache.put(request, clonedResponse);
      }
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Network First strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const clonedResponse = safeCloneResponse(networkResponse);
      if (clonedResponse) {
        await cache.put(request, clonedResponse);
      }
    }
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response("Offline", { status: 503 });
  }
}

// Check if it's a static asset
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

// Check if it's a dynamic asset
function isDynamicAsset(pathname) {
  return pathname.startsWith("/_next/");
}

// Check if it's an API request
function isApiRequest(pathname) {
  return pathname.startsWith("/api/");
}

// Message handler for communication with the app
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches
        .keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        })
        .then(() => {
          console.log("Cache cleared successfully");
        })
        .catch(error => {
          console.error("Error during cache cleanup:", error);
        })
    );
  }
});
