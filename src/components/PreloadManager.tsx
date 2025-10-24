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
    // Précharger les routes importantes
    const importantRoutes = ["/classements", "/a-propos"];

    const preloadRoute = (route: string) => {
      if (!preloadedRef.current.has(route)) {
        router.prefetch(route);
        preloadedRef.current.add(route);
      }
    };

    // Précharger après un délai pour ne pas impacter le chargement initial
    const timeoutId = setTimeout(() => {
      importantRoutes.forEach(preloadRoute);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [router]);

  // Précharger les données API importantes
  useEffect(() => {
    const preloadApiData = async () => {
      try {
        // Précharger les données de base
        const apiEndpoints = [
          "/api/rankings?poolId=1",
          "/api/matches?poolId=1",
        ];

        // Utiliser fetch avec cache pour précharger
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

    // Précharger après le chargement initial
    const timeoutId = setTimeout(preloadApiData, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  return <>{children}</>;
}

// Hook pour précharger des données spécifiques
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
