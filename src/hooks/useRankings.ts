import { useState, useEffect } from "react";

import { Ranking } from "../lib/fffa-api";

export function useRankings(poolId: number) {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (poolId === 0) {
      setRankings([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchRankings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/rankings?poolId=${poolId}`);

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setRankings(data.rankings || []);
      } catch (err) {
        console.error("Erreur lors du chargement des classements:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setRankings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [poolId]);

  return { rankings, loading, error };
}
