import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useChampionshipsOptimized,
  usePoolsOptimized,
  useMatchesOptimized,
  useRankingsOptimized,
  useDaysOptimized,
} from "./useSupabaseOptimized";

import { logger } from "@/lib/logger-advanced";
import { Ranking as SupabaseRanking } from "@/lib/supabase";

// Hook qui utilise Supabase pour la page de résultats
export function useAppDataSupabase() {
  // Local state for selections
  const [currentSeason, setCurrentSeason] = useState(2026);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState(0);
  const [selectedPoolId, setSelectedPoolId] = useState(0);
  const [selectedDayId, setSelectedDayId] = useState(0);

  // État pour tracker les changements de poule
  const [isChangingPool, setIsChangingPool] = useState(false);

  // Hooks Supabase optimisés
  const {
    data: championshipsData,
    isLoading: championshipsLoading,
    error: championshipsError,
  } = useChampionshipsOptimized(currentSeason);

  const championships = championshipsData?.data || [];

  // Mapper les données Supabase vers le format attendu par les composants
  const mappedChampionships = championships.map(c => ({
    id: c.id,
    label: c.name,
    season: parseInt(c.season),
    male: !c.name.toLowerCase().includes("mixte"), // false pour mixte, true pour les autres
  }));

  // Logger la source des données
  useEffect(() => {
    if (championships.length > 0) {
      logger.logSupabaseSync("championships_loaded", {
        count: championships.length,
        source: championshipsData?.source || "supabase",
        firstChampionship: championships[0]?.name,
      });
    }
  }, [championships, championshipsData?.source]);

  // Forcer la sélection des données de la saison courante
  useEffect(() => {
    if (mappedChampionships.length > 0 && selectedChampionshipId === 0) {
      const championshipCurrentSeason = mappedChampionships.find(
        c => c.season === currentSeason
      );
      if (championshipCurrentSeason) {
        setSelectedChampionshipId(championshipCurrentSeason.id);
      }
    }
  }, [mappedChampionships, selectedChampionshipId, currentSeason]);

  // Auto-selection logic for effective IDs - Prioriser la saison courante
  const effectiveChampionshipId = useMemo(() => {
    if (selectedChampionshipId > 0) return selectedChampionshipId;

    // Chercher d'abord un championnat de la saison courante
    const championshipCurrentSeason = mappedChampionships.find(
      c => c.season === currentSeason
    );
    if (championshipCurrentSeason) return championshipCurrentSeason.id;

    // Sinon prendre le premier disponible
    return mappedChampionships.length > 0 ? mappedChampionships[0].id : 0;
  }, [selectedChampionshipId, mappedChampionships, currentSeason]);

  const {
    data: poolsData,
    isLoading: poolsLoading,
    error: poolsError,
  } = usePoolsOptimized(effectiveChampionshipId);

  const pools = poolsData?.data || [];

  // Mapper les poules Supabase vers le format attendu
  const mappedPools = pools.map(p => ({
    id: p.id,
    championship_id: p.championship_id,
    phase_id: 1, // Valeur par défaut
    label: p.name,
  }));

  // Logger la source des poules
  useEffect(() => {
    if (pools.length > 0) {
      logger.logSupabaseSync("pools_loaded", {
        count: pools.length,
        source: poolsData?.source || "supabase",
        championshipId: effectiveChampionshipId,
        firstPool: pools[0]?.name,
      });
    }
  }, [pools, poolsData?.source, effectiveChampionshipId]);

  const effectivePoolId = useMemo(() => {
    if (selectedPoolId > 0) return selectedPoolId;
    return mappedPools.length > 0 ? mappedPools[0].id : 0;
  }, [selectedPoolId, mappedPools]);

  const {
    data: matchesData,
    isLoading: matchesLoading,
    error: matchesError,
  } = useMatchesOptimized(effectivePoolId);

  const matches = matchesData?.data || [];

  // Mapper les matchs Supabase vers le format attendu
  const mappedMatches = matches.map(m => ({
    id: parseInt(m.id) || 0, // Convertir string vers number
    championship_id: effectiveChampionshipId,
    phase_id: 1,
    pool_id: m.pool_id,
    day_id: parseInt(m.match_date.replace(/-/g, "")) || 0, // Créer un day_id basé sur la date
    date: m.match_date,
    team_a: {
      name: m.team_home,
      score: m.score_home || 0,
      general_forfeit: false,
    },
    team_b: {
      name: m.team_away,
      score: m.score_away || 0,
      general_forfeit: false,
    },
    sheet: null,
  }));

  // Utiliser le hook Supabase pour récupérer les jours
  const {
    data: daysData,
    isLoading: daysLoading,
    error: daysError,
  } = useDaysOptimized(effectivePoolId);

  const supabaseDays = daysData?.data || [];

  // Mapper les jours Supabase vers le format attendu
  const days = supabaseDays.map(d => ({
    id: d.id,
    championship_id: effectiveChampionshipId, // Utiliser l'ID du championnat actuel
    phase_id: 1, // Valeur par défaut
    pool_id: d.pool_id,
    label: d.name, // Utiliser le nom réel de la journée
    date: d.date,
    number: 1, // Valeur par défaut
  }));

  // Logger la source des jours
  useEffect(() => {
    if (days.length > 0) {
      logger.logSupabaseSync("days_loaded", {
        count: days.length,
        source: daysData?.source || "supabase",
        poolId: effectivePoolId,
        firstDay: days[0]?.label,
      });
    }
  }, [days, daysData?.source, effectivePoolId]);

  const effectiveDayId = useMemo(() => {
    if (selectedDayId > 0) return selectedDayId;
    return days.length > 0 ? days[0].id : 0;
  }, [selectedDayId, days]);

  const {
    data: rankingsData,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useRankingsOptimized(effectivePoolId);

  const rankings = rankingsData?.data || [];

  // Mapper les classements Supabase vers le format attendu
  const mappedRankings = (rankings as SupabaseRanking[]).map(r => ({
    position: r.position,
    club: {
      id: parseInt(r.id) || 0,
      label: r.team_name,
      general_forfeit: false,
    },
    points: r.points, // Maintenant correct car nous utilisons ranking.points dans la sync
    j: r.played,
    g: r.won,
    n: r.drawn,
    p: r.lost,
    points_won: r.goals_for, // Maintenant correct car nous utilisons ranking.points_won
    points_loss: r.goals_against, // Maintenant correct car nous utilisons ranking.points_loss
    points_diff: r.goal_difference,
  }));

  // Logger la source des classements
  useEffect(() => {
    if (rankings.length > 0) {
      logger.logSupabaseSync("rankings_loaded", {
        count: rankings.length,
        source: rankingsData?.source || "supabase",
        poolId: effectivePoolId,
        firstTeam: (rankings as SupabaseRanking[])[0]?.team_name,
      });
    }
  }, [rankings, rankingsData?.source, effectivePoolId]);

  // Disable pool change state when data is loaded
  useEffect(() => {
    if (isChangingPool && days.length > 0) {
      setIsChangingPool(false);
    }
  }, [isChangingPool, days.length]);

  // Optimized handlers with useCallback
  const handleSeasonChange = useCallback((season: string) => {
    const seasonNum = Number(season);
    setCurrentSeason(seasonNum);
    setSelectedChampionshipId(0);
    setSelectedPoolId(0);
    setSelectedDayId(0);
  }, []);

  const handleChampionshipChange = useCallback((championshipId: string) => {
    const id = Number(championshipId);
    setSelectedChampionshipId(id);
    setSelectedPoolId(0);
    setSelectedDayId(0);
  }, []);

  const handlePoolChange = useCallback((poolId: string) => {
    const id = Number(poolId);
    setIsChangingPool(true);
    setSelectedPoolId(id);
    setSelectedDayId(0);
  }, []);

  const handleDayChange = useCallback((dayId: string) => {
    const id = Number(dayId);
    setSelectedDayId(id);
  }, []);

  // Calculated states
  const initialLoading = useMemo(() => {
    // The skeleton remains displayed while loading championships OR when we don't have championships yet
    const shouldShowSkeleton =
      championshipsLoading || mappedChampionships.length === 0;

    return shouldShowSkeleton;
  }, [championshipsLoading, mappedChampionships.length]);

  const poolsAreLoading = poolsLoading && mappedPools.length === 0;

  const hasData = useMemo(() => {
    return (
      mappedChampionships.length > 0 &&
      mappedPools.length > 0 &&
      days.length > 0
    );
  }, [mappedChampionships.length, mappedPools.length, days.length]);

  const hasPools = useMemo(() => {
    return mappedChampionships.length > 0 && mappedPools.length > 0;
  }, [mappedChampionships.length, mappedPools.length]);

  // État de chargement pour les changements de poule
  const poolChangeLoading = isChangingPool;

  return {
    // État
    currentSeason,
    selectedChampionshipId: effectiveChampionshipId,
    selectedPoolId: effectivePoolId,
    selectedDayId: effectiveDayId,

    // Data
    championships: mappedChampionships,
    pools: mappedPools,
    days,
    matches: mappedMatches,
    rankings: mappedRankings,

    // États de chargement
    loading: {
      championships: championshipsLoading,
      pools: poolsLoading,
      days: daysLoading,
      matches: matchesLoading,
      rankings: rankingsLoading,
    },
    initialLoading,
    poolsAreLoading,
    poolChangeLoading,
    hasData,
    hasPools,

    // Erreurs
    errors: {
      championships: championshipsError?.message || null,
      pools: poolsError?.message || null,
      days: daysError?.message || null,
      matches: matchesError?.message || null,
      rankings: rankingsError?.message || null,
    },

    // Handlers
    handleSeasonChange,
    handleChampionshipChange,
    handlePoolChange,
    handleDayChange,

    // Actions directes
    setSeason: setCurrentSeason,
    setChampionship: setSelectedChampionshipId,
    setPool: setSelectedPoolId,
    setDay: setSelectedDayId,
    resetSelections: () => {
      setSelectedChampionshipId(0);
      setSelectedPoolId(0);
      setSelectedDayId(0);
    },
  };
}
