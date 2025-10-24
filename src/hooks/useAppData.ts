import { useCallback, useEffect, useMemo, useState } from "react";

import { useChampionships as useChampionshipsHook } from "../hooks/useChampionships";
import { useMatches as useMatchesHook } from "../hooks/useMatches";
import { usePools as usePoolsHook } from "../hooks/usePools";
import { useRankings as useRankingsHook } from "../hooks/useRankings";

// Simplified hook that uses React Query hooks directly
export function useAppData() {
  // Local state for selections
  const [currentSeason, setCurrentSeason] = useState(2026);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState(0);
  const [selectedPoolId, setSelectedPoolId] = useState(0);
  const [selectedDayId, setSelectedDayId] = useState(0);

  // État pour tracker les changements de poule
  const [isChangingPool, setIsChangingPool] = useState(false);

  // Hooks React Query pour la logique de fetching
  const {
    data: fetchedChampionships = [],
    isLoading: championshipsLoading,
    error: championshipsError,
  } = useChampionshipsHook(currentSeason);

  // Auto-selection logic for effective IDs
  const effectiveChampionshipId = useMemo(() => {
    if (selectedChampionshipId > 0) return selectedChampionshipId;
    return fetchedChampionships.length > 0 ? fetchedChampionships[0].id : 0;
  }, [selectedChampionshipId, fetchedChampionships]);

  const {
    data: fetchedPools = [],
    isLoading: poolsLoading,
    error: poolsError,
  } = usePoolsHook(effectiveChampionshipId);

  const effectivePoolId = useMemo(() => {
    if (selectedPoolId > 0) return selectedPoolId;
    return fetchedPools.length > 0 ? fetchedPools[0].id : 0;
  }, [selectedPoolId, fetchedPools]);

  const {
    data: matchesData,
    isLoading: matchesLoading,
    error: matchesError,
  } = useMatchesHook(effectivePoolId);

  const fetchedDays = matchesData?.days || [];
  const fetchedMatches = matchesData?.matches || [];

  const effectiveDayId = useMemo(() => {
    if (selectedDayId > 0) return selectedDayId;
    return fetchedDays.length > 0 ? fetchedDays[0].id : 0;
  }, [selectedDayId, fetchedDays]);

  const {
    data: rankingsData,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useRankingsHook(effectivePoolId);

  const fetchedRankings = rankingsData?.rankings || [];

  // Disable pool change state when data is loaded
  useEffect(() => {
    if (isChangingPool && fetchedDays.length > 0) {
      setIsChangingPool(false);
    }
  }, [isChangingPool, fetchedDays.length]);

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
      championshipsLoading || fetchedChampionships.length === 0;

    return shouldShowSkeleton;
  }, [championshipsLoading, fetchedChampionships.length]);

  const poolsAreLoading = poolsLoading && fetchedPools.length === 0;

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

  // État de chargement pour les changements de poule
  const poolChangeLoading = isChangingPool;

  return {
    // État
    currentSeason,
    selectedChampionshipId: effectiveChampionshipId,
    selectedPoolId: effectivePoolId,
    selectedDayId: effectiveDayId,

    // Data
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
    poolChangeLoading,
    hasData,
    hasPools,

    // Erreurs
    errors: {
      championships: championshipsError?.message || null,
      pools: poolsError?.message || null,
      days: matchesError?.message || null,
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
