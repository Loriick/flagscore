"use client";

import { useEffect, useState } from "react";

interface ServiceWorkerManagerProps {
  children: React.ReactNode;
}

export function ServiceWorkerManager({ children }: ServiceWorkerManagerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Handle connectivity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Enregistrer le service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(registration => {
          setSwRegistration(registration);
          console.log("Service Worker enregistré:", registration);
        })
        .catch(error => {
          console.error("Erreur d'enregistrement du Service Worker:", error);
        });

      // Listen for updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
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

      {/* Development buttons (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 space-x-2 z-50">
          <button
            onClick={updateServiceWorker}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
          >
            Update SW
          </button>
          <button
            onClick={clearCache}
            className="bg-red-600 text-white px-3 py-1 rounded text-xs"
          >
            Clear Cache
          </button>
        </div>
      )}
    </>
  );
}
