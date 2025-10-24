import { useCallback, useMemo, useState } from "react";

import { useChampionships as useChampionshipsHook } from "../hooks/useChampionships";
import { useMatches as useMatchesHook } from "../hooks/useMatches";
import { usePools as usePoolsHook } from "../hooks/usePools";
import { useRankings as useRankingsHook } from "../hooks/useRankings";

// Hook simplifié qui utilise directement les hooks existants
export function useAppData() {
  // État local pour les sélections
  const [currentSeason, setCurrentSeason] = useState(2026);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState(0);
  const [selectedPoolId, setSelectedPoolId] = useState(0);
  const [selectedDayId, setSelectedDayId] = useState(0);

  // Hooks existants pour la logique de fetching
  const {
    championships: fetchedChampionships,
    loading: championshipsLoading,
    error: championshipsError,
  } = useChampionshipsHook(currentSeason);

  // Logique de sélection automatique pour les IDs effectifs
  const effectiveChampionshipId = useMemo(() => {
    if (selectedChampionshipId > 0) return selectedChampionshipId;
    return fetchedChampionships.length > 0 ? fetchedChampionships[0].id : 0;
  }, [selectedChampionshipId, fetchedChampionships]);

  const {
    pools: fetchedPools,
    loading: poolsLoading,
    error: poolsError,
  } = usePoolsHook(effectiveChampionshipId);

  const effectivePoolId = useMemo(() => {
    if (selectedPoolId > 0) return selectedPoolId;
    return fetchedPools.length > 0 ? fetchedPools[0].id : 0;
  }, [selectedPoolId, fetchedPools]);

  const {
    days: fetchedDays,
    matches: fetchedMatches,
    loading: matchesLoading,
    error: matchesError,
  } = useMatchesHook(effectivePoolId);

  const effectiveDayId = useMemo(() => {
    if (selectedDayId > 0) return selectedDayId;
    return fetchedDays.length > 0 ? fetchedDays[0].id : 0;
  }, [selectedDayId, fetchedDays]);

  const {
    rankings: fetchedRankings,
    loading: rankingsLoading,
    error: rankingsError,
  } = useRankingsHook(effectivePoolId);

  // Handlers optimisés avec useCallback
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
    setSelectedPoolId(id);
    setSelectedDayId(0);
  }, []);

  const handleDayChange = useCallback((dayId: string) => {
    const id = Number(dayId);
    setSelectedDayId(id);
  }, []);

  // États calculés
  const initialLoading = useMemo(() => {
    return championshipsLoading && fetchedChampionships.length === 0;
  }, [championshipsLoading, fetchedChampionships.length]);

  const poolsAreLoading = useMemo(() => {
    return poolsLoading && fetchedPools.length === 0;
  }, [poolsLoading, fetchedPools.length]);

  const hasData = useMemo(() => {
    return (
      fetchedChampionships.length > 0 &&
      fetchedPools.length > 0 &&
      fetchedDays.length > 0
    );
  }, [fetchedChampionships.length, fetchedPools.length, fetchedDays.length]);

  const hasPools = useMemo(() => {
    return fetchedChampionships.length > 0 && fetchedPools.length > 0;
  }, [fetchedChampionships.length, fetchedPools.length]);

  return {
    // État
    currentSeason,
    selectedChampionshipId: effectiveChampionshipId,
    selectedPoolId: effectivePoolId,
    selectedDayId: effectiveDayId,

    // Données
    championships: fetchedChampionships,
    pools: fetchedPools,
    days: fetchedDays,
    matches: fetchedMatches,
    rankings: fetchedRankings,

    // États de chargement
    loading: {
      championships: championshipsLoading,
      pools: poolsLoading,
      days: matchesLoading,
      matches: matchesLoading,
      rankings: rankingsLoading,
    },
    initialLoading,
    poolsAreLoading,
    hasData,
    hasPools,

    // Erreurs
    errors: {
      championships: championshipsError,
      pools: poolsError,
      days: matchesError,
      matches: matchesError,
      rankings: rankingsError,
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
