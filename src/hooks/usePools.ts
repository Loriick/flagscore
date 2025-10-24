import { useQuery } from "@tanstack/react-query";

import { Pool } from "../app/types";
import { getPhases, getPools } from "../lib/fffa-api";

export function usePools(championshipId: number) {
  return useQuery({
    queryKey: ["pools", championshipId],
    queryFn: async () => {
      if (!championshipId) return [];

      // 1. Get competition phases
      const phases = await getPhases(championshipId);

      // 2. Get all pools
      const allPools: Pool[] = [];
      for (const phase of phases) {
        try {
          const phasePools = await getPools(phase.id);
          allPools.push(...phasePools);
        } catch (error) {
          console.error(`Error pools for phase ${phase.id}:`, error);
        }
      }

      return allPools;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: championshipId > 0,
  });
}
