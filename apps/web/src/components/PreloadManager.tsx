"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface PreloadManagerProps {
  children: React.ReactNode;
}

export function PreloadManager({ children }: PreloadManagerProps) {
  const router = useRouter();
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Preload important routes
    const importantRoutes = ["/classements", "/a-propos"];

    const preloadRoute = (route: string) => {
      if (!preloadedRef.current.has(route)) {
        router.prefetch(route);
        preloadedRef.current.add(route);
      }
    };

    // Preload after a delay to not impact initial loading
    const timeoutId = setTimeout(() => {
      importantRoutes.forEach(preloadRoute);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [router]);

  // Preload important API data (only in production)
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return; // Skip API preloading in development
    }

    const preloadApiData = async () => {
      try {
        // Preload basic data
        const apiEndpoints = [
          "/api/rankings?poolId=1",
          "/api/matches?poolId=1",
        ];

        // Use fetch with cache to preload
        await Promise.allSettled(
          apiEndpoints.map(endpoint =>
            fetch(endpoint, {
              cache: "force-cache",
              headers: { Accept: "application/json" },
            })
          )
        );
      } catch (error) {
        console.warn("Erreur lors du préchargement des données API:", error);
      }
    };

    // Preload after initial loading
    const timeoutId = setTimeout(preloadApiData, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  return <>{children}</>;
}

// Hook to preload specific data
export function usePreloadData() {
  const preloadedRef = useRef<Set<string>>(new Set());

  const preloadData = async (url: string, options?: RequestInit) => {
    if (!preloadedRef.current.has(url)) {
      try {
        await fetch(url, {
          ...options,
          cache: "force-cache",
        });
        preloadedRef.current.add(url);
      } catch (error) {
        console.warn(`Erreur lors du préchargement de ${url}:`, error);
      }
    }
  };

  return { preloadData };
}
