import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { defaultDayId } from "./useAppDataSupabase";
import { useShareableUrl } from "./useShareableUrl";

import {
  SOCIAL_CHAMPIONSHIPS,
  SOCIAL_SEASON,
  socialDays,
  socialMatches,
  socialPools,
  socialRankings,
  type SocialMatchRow,
} from "@/lib/social/results";
import { supabase } from "@/lib/supabase";

/** Scores retenus, toutes compétitions : quelques centaines de lignes. */
async function fetchSocialMatches(): Promise<SocialMatchRow[]> {
  const { data, error } = await supabase
    .from("social_matches")
    .select(
      "match_key, event_key, team_home, team_away, score_home, score_away, status, accounts"
    )
    .eq("auto_apply", true);
  if (error) throw new Error(error.message);
  return (data ?? []) as SocialMatchRow[];
}

const firstId = (items: Array<{ id: number }>) => items[0]?.id ?? 0;
const pick = (id: number, items: Array<{ id: number }>) =>
  items.some(i => i.id === id) ? id : firstId(items);

/**
 * Données de la page Résultats à partir des scores relevés sur Instagram.
 * Même forme que `useAppDataSupabase`, pour réutiliser les mêmes composants.
 */
export function useSocialResults() {
  const urlState = useShareableUrl();
  const [championshipId, setChampionshipId] = useState(urlState.championship);
  const [poolId, setPoolId] = useState(urlState.pool);
  const [dayId, setDayId] = useState(urlState.day);

  const query = useQuery({
    queryKey: ["social-matches"],
    queryFn: fetchSocialMatches,
    staleTime: 5 * 60_000,
  });
  const rows = useMemo(() => query.data ?? [], [query.data]);

  const championships = SOCIAL_CHAMPIONSHIPS;
  const selectedChampionshipId = pick(championshipId, championships);
  const pools = useMemo(
    () => socialPools(selectedChampionshipId),
    [selectedChampionshipId]
  );
  const selectedPoolId = pick(poolId, pools);
  const days = useMemo(() => socialDays(selectedPoolId), [selectedPoolId]);
  const selectedDayId = days.some(d => d.id === dayId)
    ? dayId
    : defaultDayId(days);

  const matches = useMemo(
    () => socialMatches(rows, selectedPoolId, selectedDayId),
    [rows, selectedPoolId, selectedDayId]
  );
  const rankings = useMemo(
    () => socialRankings(rows, selectedPoolId),
    [rows, selectedPoolId]
  );

  const { updateUrl } = urlState;

  const handleChampionshipChange = useCallback(
    (id: string) => {
      setChampionshipId(Number(id));
      setPoolId(0);
      setDayId(0);
      updateUrl({ championship: Number(id) || null, pool: null, day: null });
    },
    [updateUrl]
  );

  const handlePoolChange = useCallback(
    (id: string) => {
      setPoolId(Number(id));
      setDayId(0);
      updateUrl({ pool: Number(id) || null, day: null });
    },
    [updateUrl]
  );

  const handleDayChange = useCallback(
    (id: string) => {
      setDayId(Number(id));
      updateUrl({ day: Number(id) || null });
    },
    [updateUrl]
  );

  const handleSeasonChange = useCallback(() => {}, []);

  const loading = query.isLoading;
  const error = query.error ? query.error.message : null;

  return {
    currentSeason: SOCIAL_SEASON,
    selectedChampionshipId,
    selectedPoolId,
    selectedDayId,
    championships,
    pools,
    days,
    matches,
    rankings,
    loading: {
      championships: false,
      pools: false,
      days: false,
      matches: loading,
      rankings: loading,
    },
    initialLoading: false,
    poolChangeLoading: false,
    errors: {
      championships: null,
      pools: null,
      days: null,
      matches: error,
      rankings: error,
    },
    handleSeasonChange,
    handleChampionshipChange,
    handlePoolChange,
    handleDayChange,
  };
}
