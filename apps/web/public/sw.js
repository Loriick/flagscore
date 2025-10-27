// Service Worker for caching resources
const STATIC_CACHE_NAME = "flagscore-static-v2";
const DYNAMIC_CACHE_NAME = "flagscore-dynamic-v2";

// Utility function to safely clone a response
function safeCloneResponse(response) {
  try {
    // Check if response is already consumed
    if (response.bodyUsed) {
      console.warn("Response body already consumed, cannot clone");
      return null;
    }
    return response.clone();
  } catch (error) {
    console.warn("Unable to clone response:", error);
    return null;
  }
}

// Resources to cache statically (only essential assets)
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/404.png",
  "/flagscore-logo-removebg-preview.png",
  "/favicon.ico",
];

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
    } else if (isHtmlRequest(request)) {
      // Network First for HTML pages with offline fallback
      event.respondWith(htmlWithOfflineFallback(request, DYNAMIC_CACHE_NAME));
    }
  }
});

// Cache First strategy - optimized for static assets
async function cacheFirst(request, cacheName) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);

    // Only cache successful responses
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      const clonedResponse = safeCloneResponse(networkResponse);

      if (clonedResponse) {
        try {
          await cache.put(request, clonedResponse);
        } catch (cacheError) {
          console.warn("Failed to cache response:", cacheError);
        }
      }
    }

    return networkResponse;
  } catch (error) {
    console.warn("Cache first strategy failed:", error);
    // Return offline page if available
    const offlineResponse = await caches.match("/404.png");
    return (
      offlineResponse ||
      new Response("Service Unavailable", {
        status: 503,
        statusText: "Service Unavailable",
      })
    );
  }
}

// Stale While Revalidate strategy - optimized for dynamic content
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);

    // Start network request in parallel
    const networkPromise = fetch(request)
      .then(async networkResponse => {
        // Only cache successful responses
        if (networkResponse.ok && networkResponse.status === 200) {
          try {
            const cache = await caches.open(cacheName);
            const clonedResponse = safeCloneResponse(networkResponse);

            if (clonedResponse) {
              await cache.put(request, clonedResponse);
            }
          } catch (cacheError) {
            console.warn("Failed to cache network response:", cacheError);
          }
        }
        return networkResponse;
      })
      .catch(error => {
        console.warn("Network request failed:", error);
        return null;
      });

    // Return cached response immediately if available, otherwise wait for network
    return cachedResponse || networkPromise;
  } catch (error) {
    console.warn("Stale while revalidate strategy failed:", error);
    return new Response("Service Unavailable", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Network First strategy - optimized for API requests
async function networkFirst(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok && networkResponse.status === 200) {
      try {
        const cache = await caches.open(cacheName);
        const clonedResponse = safeCloneResponse(networkResponse);

        if (clonedResponse) {
          await cache.put(request, clonedResponse);
        }
      } catch (cacheError) {
        console.warn("Failed to cache API response:", cacheError);
      }
    }

    return networkResponse;
  } catch (error) {
    console.warn("Network first strategy failed, trying cache:", error);

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: "Service Unavailable",
        message: "Unable to fetch data. Please check your connection.",
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      }
    );
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

// Check if it's an HTML request
function isHtmlRequest(request) {
  return request.headers.get("accept")?.includes("text/html");
}

// HTML with offline fallback strategy
async function htmlWithOfflineFallback(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok && networkResponse.status === 200) {
      try {
        const cache = await caches.open(cacheName);
        const clonedResponse = safeCloneResponse(networkResponse);

        if (clonedResponse) {
          await cache.put(request, clonedResponse);
        }
      } catch (cacheError) {
        console.warn("Failed to cache HTML response:", cacheError);
      }
    }

    return networkResponse;
  } catch (error) {
    console.warn("Network request failed, trying cache:", error);

    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to offline page
    const offlineResponse = await caches.match("/offline");
    if (offlineResponse) {
      return offlineResponse;
    }

    // Last resort: return a simple offline message
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hors ligne - Flagscore</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              background: linear-gradient(135deg, #1f2937, #1e3a8a, #1f2937);
              color: white; 
              margin: 0; 
              padding: 20px; 
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { text-align: center; max-width: 400px; }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { opacity: 0.8; margin-bottom: 2rem; }
            button { 
              background: #2563eb; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 8px; 
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Vous êtes hors ligne</h1>
            <p>Cette page nécessite une connexion internet pour fonctionner.</p>
            <button onclick="window.location.reload()">Réessayer</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}

// Message handler for communication with the app
self.addEventListener("message", event => {
  if (!event.data || !event.data.type) {
    return;
  }

  switch (event.data.type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CLEAR_CACHE":
      event.waitUntil(clearAllCaches());
      break;

    case "GET_CACHE_STATUS":
      event.waitUntil(
        getCacheStatus().then(status => {
          event.ports[0]?.postMessage(status);
        })
      );
      break;

    default:
      console.warn("Unknown message type:", event.data.type);
  }
});

// Helper function to clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    console.log("All caches cleared successfully");
  } catch (error) {
    console.error("Error during cache cleanup:", error);
  }
}

// Helper function to get cache status
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = keys.length;
    }

    return status;
  } catch (error) {
    console.error("Error getting cache status:", error);
    return { error: "Failed to get cache status" };
  }
}
