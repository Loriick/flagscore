import { useQuery } from "@tanstack/react-query";

import { Day, Match } from "../lib/fffa-api";

export interface PoolDataResponse {
  days: Day[];
  matches: Match[];
  selectedDayId: number;
  cached: boolean;
  error?: string;
}

export function usePoolData(poolId: number, dayId: number = 0) {
  return useQuery({
    queryKey: ["pool-data", poolId, dayId],
    queryFn: async (): Promise<PoolDataResponse> => {
      const params = new URLSearchParams({
        poolId: poolId.toString(),
        dayId: dayId.toString(),
      });

      const response = await fetch(`/api/pool-data?${params}`);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Trop de requêtes - Veuillez patienter");
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: poolId > 0,
  });
}
