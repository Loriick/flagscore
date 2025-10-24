import { useCallback, useEffect, useState } from "react";

import { useClientCache } from "../hooks/useClientCache";
import { useDebounce } from "../hooks/useDebounce";

interface UseOptimizedDataOptions<T> {
  cacheKey: string;
  fetchFn: () => Promise<T>;
  debounceMs?: number;
  cacheTtl?: number;
  enabled?: boolean;
}

export function useOptimizedData<T>({
  cacheKey,
  fetchFn,
  debounceMs = 300,
  cacheTtl = 5 * 60 * 1000, // 5 minutes
  enabled = true,
}: UseOptimizedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchData, getCachedData } = useClientCache<T>(cacheKey, {
    ttl: cacheTtl,
  });

  // Debouncer pour éviter trop de requêtes
  const debouncedFetch = useDebounce(fetchFn, { delay: debounceMs });

  // Fonction pour récupérer les données
  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        // Essayer d'abord le cache
        if (!forceRefresh) {
          const cachedData = getCachedData();
          if (cachedData) {
            setData(cachedData);
            setIsLoading(false);
            return cachedData;
          }
        }

        // Récupérer les données avec mise en cache
        const result = await fetchData(debouncedFetch, forceRefresh);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, fetchData, getCachedData, debouncedFetch]
  );

  // Charger les données au montage
  useEffect(() => {
    if (enabled) {
      loadData();
    }
  }, [enabled, loadData]);

  // Fonction pour rafraîchir les données
  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  // Fonction pour invalider le cache
  const invalidate = useCallback(() => {
    setData(null);
  }, []);

  // État calculé
  const isInitialLoading = isLoading && !data;
  const isRefreshing = isLoading && !!data;

  return {
    data,
    isLoading: isInitialLoading,
    isRefreshing,
    error,
    refresh,
    invalidate,
    loadData,
  };
}

// Hook spécialisé pour les données de matchs
export function useOptimizedMatches(poolId: number) {
  return useOptimizedData({
    cacheKey: `matches-${poolId}`,
    fetchFn: async () => {
      const response = await fetch(`/api/matches?poolId=${poolId}`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    debounceMs: 500,
    cacheTtl: 2 * 60 * 1000, // 2 minutes pour les matchs
    enabled: poolId > 0,
  });
}

// Hook spécialisé pour les classements
export function useOptimizedRankings(poolId: number) {
  return useOptimizedData({
    cacheKey: `rankings-${poolId}`,
    fetchFn: async () => {
      const response = await fetch(`/api/rankings?poolId=${poolId}`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    debounceMs: 300,
    cacheTtl: 5 * 60 * 1000, // 5 minutes pour les classements
    enabled: poolId > 0,
  });
}
