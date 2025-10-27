import { useQuery } from "@tanstack/react-query";

import { getRankings } from "@/lib/fffa-api";

export function useRankingsDirect(poolId: number) {
  return useQuery({
    queryKey: ["rankings", poolId],
    queryFn: () => getRankings(poolId),
    enabled: poolId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
