import { useState, useEffect, useCallback } from "react";

import { Ranking } from "../lib/fffa-api";

// Cache côté client
const clientCache = new Map<string, { data: Ranking[]; timestamp: number }>();
const CLIENT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes côté client

export function useRankings(poolId: number) {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchRankings = useCallback(async (poolId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rankings?poolId=${poolId}`);

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRankings(data.rankings || []);
      setCached(data.cached || false);

      // Mettre en cache côté client
      const cacheKey = `rankings-${poolId}`;
      clientCache.set(cacheKey, {
        data: data.rankings || [],
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("Erreur lors du chargement des classements:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (poolId === 0) {
      setRankings([]);
      setLoading(false);
      setError(null);
      setCached(false);
      return;
    }

    // Vérifier le cache côté client d'abord
    const cacheKey = `rankings-${poolId}`;
    const cached = clientCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_DURATION) {
      console.log(`📦 Cache hit pour rankings-${poolId}`, cached);
      setRankings(cached.data);
      setLoading(false);
      setCached(true);
      return;
    }

    console.log(`🔄 Cache miss pour rankings-${poolId}, fetching...`);

    fetchRankings(poolId);
  }, [poolId, fetchRankings]);

  return { rankings, loading, error, cached };
}
