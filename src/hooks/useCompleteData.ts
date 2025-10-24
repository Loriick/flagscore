import { useQuery } from "@tanstack/react-query";

interface CompleteDataResponse {
  championships: any[];
  pools: any[];
  days: any[];
  matches: any[];
  selectedChampionshipId: number;
  selectedPoolId: number;
  selectedDayId: number;
  cached: boolean;
  error?: string;
}

export function useCompleteData(
  season: number,
  championshipId: number = 0,
  poolId: number = 0
) {
  return useQuery({
    queryKey: ["complete-data", season, championshipId, poolId],
    queryFn: async (): Promise<CompleteDataResponse> => {
      const params = new URLSearchParams({
        season: season.toString(),
        championshipId: championshipId.toString(),
        poolId: poolId.toString(),
      });

      const response = await fetch(`/api/complete-data?${params}`);

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
    enabled: season > 0,
  });
}
