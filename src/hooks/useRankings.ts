import { useQuery } from "@tanstack/react-query";

export function useRankings(poolId: number) {
  return useQuery({
    queryKey: ["rankings", poolId],
    queryFn: async () => {
      if (!poolId) return { rankings: [], cached: false };

      const response = await fetch(`/api/rankings?poolId=${poolId}`);

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        rankings: data.rankings || [],
        cached: data.cached || false,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: poolId > 0,
  });
}
