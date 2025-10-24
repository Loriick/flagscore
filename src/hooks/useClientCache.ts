import { useCallback, useRef, useState } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface UseClientCacheOptions {
  ttl?: number; // Time to live en millisecondes
  maxSize?: number; // Taille maximale du cache
}

export function useClientCache<T>(
  key: string,
  options: UseClientCacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // 5 minutes par défaut
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nettoyer le cache expiré
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;

    for (const [cacheKey, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(cacheKey);
      }
    }
  }, []);

  // Limiter la taille du cache
  const limitCacheSize = useCallback(() => {
    const cache = cacheRef.current;
    if (cache.size > maxSize) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toDelete = entries.slice(0, cache.size - maxSize);
      toDelete.forEach(([cacheKey]) => cache.delete(cacheKey));
    }
  }, [maxSize]);

  // Obtenir les données du cache
  const getCachedData = useCallback((): T | null => {
    cleanExpiredCache();

    const entry = cacheRef.current.get(key);
    if (entry) {
      const now = Date.now();
      if (now - entry.timestamp <= entry.ttl) {
        return entry.data;
      } else {
        cacheRef.current.delete(key);
      }
    }
    return null;
  }, [key, cleanExpiredCache]);

  // Mettre en cache les données
  const setCachedData = useCallback(
    (data: T, customTtl?: number) => {
      const cache = cacheRef.current;
      cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: customTtl || ttl,
      });
      limitCacheSize();
    },
    [key, ttl, limitCacheSize]
  );

  // Fonction pour récupérer les données avec cache
  const fetchData = useCallback(
    async (fetchFn: () => Promise<T>, forceRefresh = false): Promise<T> => {
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          return cachedData;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchFn();
        setCachedData(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getCachedData, setCachedData]
  );

  // Nettoyer le cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Supprimer une entrée spécifique
  const removeFromCache = useCallback((cacheKey: string) => {
    cacheRef.current.delete(cacheKey);
  }, []);

  // Obtenir les statistiques du cache
  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();
    let expiredCount = 0;
    let validCount = 0;

    for (const entry of cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      totalSize: cache.size,
      validEntries: validCount,
      expiredEntries: expiredCount,
      maxSize,
    };
  }, [maxSize]);

  return {
    fetchData,
    getCachedData,
    setCachedData,
    clearCache,
    removeFromCache,
    getCacheStats,
    isLoading,
    error,
  };
}
