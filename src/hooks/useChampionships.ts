import { useQuery } from "@tanstack/react-query";

import { getChampionships } from "../lib/fffa-api";

export function useChampionships(season: number) {
  return useQuery({
    queryKey: ["championships", season],
    queryFn: () => getChampionships(season),
    staleTime: 0, // Pas de cache pour debug
    gcTime: 0, // Pas de cache pour debug
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: season > 0,
  });
}
