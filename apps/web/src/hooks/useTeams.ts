import { useQuery } from "@tanstack/react-query";

import { Championship, Pool, Team } from "../lib/supabase";

interface UseTeamsOptions {
  searchTerm?: string;
  poolId?: number;
  championshipId?: number;
  enabled?: boolean;
}

export function useTeams({
  searchTerm,
  poolId,
  championshipId,
  enabled = true,
}: UseTeamsOptions = {}) {
  return useQuery({
    queryKey: ["teams", searchTerm, poolId, championshipId],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (poolId) params.append("poolId", poolId.toString());
      if (championshipId)
        params.append("championshipId", championshipId.toString());

      const response = await fetch(`/api/teams?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des équipes");
      }

      const result = await response.json();
      return result.data as (Team & {
        pools: Pool;
        championships: Championship;
      })[];
    },
    enabled,
    // Pour la recherche, on veut toujours relire Supabase quand l'input change
    // donc pas de fenêtre de staleness
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: "always",
    retry: 1,
  });
}

export function useTeam(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'équipe");
      }

      const result = await response.json();
      return result.data as Team & { pools: Pool; championships: Championship };
    },
    enabled: enabled && !!teamId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}

export function useSyncTeams() {
  return useQuery({
    queryKey: ["sync-teams"],
    queryFn: async () => {
      const response = await fetch("/api/teams", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la synchronisation des équipes");
      }

      const result = await response.json();
      return result.data as Team[];
    },
    enabled: false, // Ne s'exécute que manuellement
    staleTime: 0,
  });
}
