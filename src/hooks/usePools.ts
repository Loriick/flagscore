import { useState, useEffect, useMemo } from "react";

import { Pool } from "../app/types";
import { ErrorHandler } from "../lib/error-handler";
import { getPhases, getPools } from "../lib/fffa-api";

export function usePools(championshipId: number) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memoizedChampionshipId = useMemo(
    () => championshipId,
    [championshipId]
  );

  useEffect(() => {
    const fetchPools = async () => {
      if (!championshipId) {
        setPools([]);
        setLoading(false);
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
        const errorMessage = ErrorHandler.handleApiError(
          err,
          `pools-${championshipId}`,
          { showToast: false }
        );
        setError(errorMessage);
        setPools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [memoizedChampionshipId]);

  return { pools, loading, error };
}
