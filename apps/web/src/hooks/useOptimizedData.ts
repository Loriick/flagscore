import { useCallback, useEffect, useState } from "react";

import { useClientCache } from "../hooks/useClientCache";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Note: debounceMs conservé pour compat mais non utilisé ici (déclenchement contrôlé ailleurs)

  // Function to fetch data
  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        // Try cache first
        if (!forceRefresh) {
          const cachedData = getCachedData();
          if (cachedData) {
            setData(cachedData);
            setIsLoading(false);
            return cachedData;
          }
        }

        // Fetch data with caching
        const result = await fetchData(fetchFn, forceRefresh);
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
    [enabled, fetchData, getCachedData, fetchFn]
  );

  // Load data on mount
  useEffect(() => {
    if (enabled) {
      loadData();
    }
  }, [enabled, loadData]);

  // Function to refresh data
  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  // Function to invalidate cache
  const invalidate = useCallback(() => {
    setData(null);
  }, []);

  // Calculated state
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

// Hook specialized for matches data
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
    cacheTtl: 2 * 60 * 1000, // 2 minutes for matches
    enabled: poolId > 0,
  });
}

// Hook specialized for rankings
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
    cacheTtl: 5 * 60 * 1000, // 5 minutes for rankings
    enabled: poolId > 0,
  });
}

// Hook specialized for matches by day
export function useOptimizedMatchesByDay(dayId: number) {
  return useOptimizedData({
    cacheKey: `matches-day-${dayId}`,
    fetchFn: async () => {
      const response = await fetch(`/api/matches?dayId=${dayId}`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    debounceMs: 400,
    cacheTtl: 90 * 1000, // 90s for day-scoped matches
    enabled: dayId > 0,
  });
}
