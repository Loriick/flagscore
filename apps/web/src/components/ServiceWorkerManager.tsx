"use client";

import { useEffect, useState } from "react";

interface ServiceWorkerManagerProps {
  children: React.ReactNode;
}

export function ServiceWorkerManager({ children }: ServiceWorkerManagerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [swError, setSwError] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Set development mode after hydration
    setIsDevelopment(process.env.NODE_ENV === "development");

    // Handle connectivity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(registration => {
          setSwRegistration(registration);
          setSwError(null);
          console.log("Service Worker registered successfully:", registration);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch(error => {
          console.error("Service Worker registration failed:", error);
          setSwError("Failed to register service worker");
        });

      // Listen for controller changes
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker controller changed, reloading...");
        window.location.reload();
      });
    } else {
      setSwError("Service Workers not supported");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Function to update the service worker
  const updateServiceWorker = () => {
    if (swRegistration) {
      swRegistration.update();
    }
  };

  // Function to clear the cache
  const clearCache = () => {
    if (swRegistration && swRegistration.active) {
      swRegistration.active.postMessage({ type: "CLEAR_CACHE" });
    }
  };

  // Function to apply update
  const applyUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  return (
    <>
      {children}

      {/* Offline status indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          <span className="text-sm font-medium">
            🔴 Mode hors ligne - Certaines fonctionnalités peuvent être limitées
          </span>
        </div>
      )}

      {/* Update available notification */}
      {updateAvailable && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 z-50">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm font-medium">
              🚀 Mise à jour disponible
            </span>
            <button
              onClick={applyUpdate}
              className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100"
            >
              Mettre à jour
            </button>
          </div>
        </div>
      )}

      {/* Service Worker error indicator */}
      {swError && isDevelopment && (
        <div className="fixed top-12 left-0 right-0 bg-yellow-600 text-white text-center py-1 z-50">
          <span className="text-xs">⚠️ Service Worker Error: {swError}</span>
        </div>
      )}

      {/* Development buttons (only in development) */}
      {isDevelopment && (
        <div className="fixed bottom-4 right-4 space-x-2 z-50">
          <button
            onClick={updateServiceWorker}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            title="Check for Service Worker updates"
          >
            Update SW
          </button>
          <button
            onClick={clearCache}
            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
            title="Clear all caches"
          >
            Clear Cache
          </button>
        </div>
      )}
    </>
  );
}
