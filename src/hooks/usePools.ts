import { useState, useEffect } from "react";

import { Pool } from "../app/types";
import { getPhases, getPools } from "../lib/fffa-api";

export function usePools(championshipId: number) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPools = async () => {
      if (!championshipId) {
        setPools([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 1. Récupérer les phases de la compétition
        const phases = await getPhases(championshipId);
        console.log("Phases récupérées:", phases);

        // 2. Récupérer toutes les pools
        const allPools: Pool[] = [];
        for (const phase of phases) {
          try {
            const phasePools = await getPools(phase.id);
            allPools.push(...phasePools);
          } catch (error) {
            console.error(`Erreur pools pour phase ${phase.id}:`, error);
          }
        }

        setPools(allPools);
        console.log("Pools récupérées:", allPools);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des pools"
        );
        console.error("Erreur lors du chargement des pools:", err);
        setPools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [championshipId]);

  return { pools, loading, error };
}
