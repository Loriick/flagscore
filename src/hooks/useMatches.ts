import { useState, useEffect, useCallback } from "react";

import { Day, Match } from "../app/types";
import { getDays, getMatches } from "../lib/fffa-api";

// Cache côté client pour les matchs
const clientCache = new Map<
  string,
  { data: { days: Day[]; matches: Match[] }; timestamp: number }
>();
const CLIENT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes côté client

export function useMatches(poolId: number) {
  const [days, setDays] = useState<Day[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchPoolData = useCallback(async (poolId: number) => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer les journées de la pool sélectionnée
      const poolDays = await getDays(poolId);
      setDays(poolDays);

      // Récupérer les matchs de la première journée
      let firstDayMatches: Match[] = [];
      if (poolDays.length > 0) {
        firstDayMatches = await getMatches(poolDays[0].id);
        setMatches(firstDayMatches);
      } else {
        setMatches([]);
      }

      setCached(false);

      // Mettre en cache côté client
      const cacheKey = `matches-${poolId}`;
      clientCache.set(cacheKey, {
        data: { days: poolDays, matches: firstDayMatches },
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("Erreur lors du chargement des données de la pool:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des données de la pool"
      );
      setDays([]);
      setMatches([]);
      setCached(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!poolId) {
      setDays([]);
      setMatches([]);
      setLoading(false);
      setError(null);
      setCached(false);
      return;
    }

    // Vérifier le cache côté client d'abord
    const cacheKey = `matches-${poolId}`;
    const cached = clientCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_DURATION) {
      console.log(`📦 Cache hit pour matches-${poolId}`, cached);
      setDays(cached.data.days);
      setMatches(cached.data.matches);
      setLoading(false);
      setCached(true);
      return;
    }

    console.log(`🔄 Cache miss pour matches-${poolId}, fetching...`);
    fetchPoolData(poolId);
  }, [poolId, fetchPoolData]);

  return { days, matches, loading, error, cached };
}
