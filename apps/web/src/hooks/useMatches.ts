import { useQuery } from "@tanstack/react-query";

import { Match } from "@flagscore/shared";
import { getDays, getMatches } from "../lib/fffa-api";

export function useMatches(poolId: number) {
  return useQuery({
    queryKey: ["matches", poolId],
    queryFn: async () => {
      if (!poolId) return { days: [], matches: [] };

      // Get days from selected pool
      const poolDays = await getDays(poolId);

      // Get matches from first day
      let firstDayMatches: Match[] = [];
      if (poolDays.length > 0) {
        firstDayMatches = await getMatches(poolDays[0].id);
      }

      return { days: poolDays, matches: firstDayMatches };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: poolId > 0,
  });
}
