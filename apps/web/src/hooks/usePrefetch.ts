import { useCallback } from "react";

// Prefetching cache
const prefetchCache = new Map<string, Promise<unknown>>();

export function usePrefetch() {
  const prefetchRankings = useCallback(async (poolId: number) => {
    const cacheKey = `rankings-${poolId}`;

    // Avoid duplicate requests
    if (prefetchCache.has(cacheKey)) {
      return prefetchCache.get(cacheKey);
    }

    const promise = fetch(`/api/rankings?poolId=${poolId}`)
      .then(res => res.json())
      .catch(err => {
        console.error("Prefetch error:", err);
        return { rankings: [], error: err.message };
      });

    prefetchCache.set(cacheKey, promise);

    // Clean cache after 10 minutes
    setTimeout(
      () => {
        prefetchCache.delete(cacheKey);
      },
      10 * 60 * 1000
    );

    return promise;
  }, []);

  const prefetchPools = useCallback(async (championshipId: number) => {
    const cacheKey = `pools-${championshipId}`;

    if (prefetchCache.has(cacheKey)) {
      return prefetchCache.get(cacheKey);
    }

    const promise = fetch(
      `/api/fffa/flag?championshipId=${championshipId}&action=pools`
    )
      .then(res => res.json())
      .catch(err => {
        console.error("Prefetch pools error:", err);
        return { pools: [], error: err.message };
      });

    prefetchCache.set(cacheKey, promise);

    setTimeout(
      () => {
        prefetchCache.delete(cacheKey);
      },
      10 * 60 * 1000
    );

    return promise;
  }, []);

  const prefetchMatches = useCallback(async (poolId: number) => {
    const cacheKey = `matches-${poolId}`;

    // Avoid duplicate requests
    if (prefetchCache.has(cacheKey)) {
      return prefetchCache.get(cacheKey);
    }

    const promise = fetch(`/api/matches?poolId=${poolId}`)
      .then(res => res.json())
      .catch(err => {
        console.error("Prefetch matches error:", err);
        return { matches: [], days: [], error: err.message };
      });

    prefetchCache.set(cacheKey, promise);

    // Clean cache after 10 minutes
    setTimeout(
      () => {
        prefetchCache.delete(cacheKey);
      },
      10 * 60 * 1000
    );

    return promise;
  }, []);

  return { prefetchRankings, prefetchPools, prefetchMatches };
}
