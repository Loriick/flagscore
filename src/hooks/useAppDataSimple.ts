import { useCallback, useState, useEffect } from "react";

import { useCompleteData } from "./useCompleteData";
import { usePoolData } from "./usePoolData";

export function useAppDataSimple() {
  const [currentSeason, setCurrentSeason] = useState(2026);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState(0);
  const [selectedPoolId, setSelectedPoolId] = useState(0);
  const [selectedDayId, setSelectedDayId] = useState(0);

  // Specific loading states for each change
  const [isChangingPool, setIsChangingPool] = useState(false);
  const [isChangingDay, setIsChangingDay] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Initial data (championships + pools) with error handling
  let initialData, initialLoading, initialError;
  try {
    const result = useCompleteData(currentSeason, selectedChampionshipId, 0);
    initialData = result.data;
    initialLoading = result.isLoading;
    initialError = result.error;
  } catch (error) {
    console.error("Erreur dans useCompleteData:", error);
    initialData = null;
    initialLoading = false;
    initialError = error;
  }

  const championships = initialData?.championships || [];
  const pools = initialData?.pools || [];

  // Use IDs selected by API if no manual selection
  const effectiveChampionshipId =
    selectedChampionshipId > 0
      ? selectedChampionshipId
      : initialData?.selectedChampionshipId || 0;
  const effectivePoolId =
    selectedPoolId > 0 ? selectedPoolId : initialData?.selectedPoolId || 0;

  // Pool-specific data (days + matches) with error handling
  let poolData, poolLoading, poolError;
  try {
    const result = usePoolData(effectivePoolId, selectedDayId);
    poolData = result.data;
    poolLoading = result.isLoading;
    poolError = result.error;
  } catch (error) {
    console.error("Erreur dans usePoolData:", error);
    poolData = null;
    poolLoading = false;
    poolError = error;
  }

  const days = poolData?.days || [];
  const matches = poolData?.matches || [];
  const effectiveDayId =
    selectedDayId > 0 ? selectedDayId : poolData?.selectedDayId || 0;

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
    setIsChangingDay(true);
    setSelectedDayId(id);
  }, []);

  // Mark that we have initial data
  useEffect(() => {
    if (!initialLoading && championships.length > 0 && pools.length > 0) {
      setHasInitialData(true);
    }
  }, [initialLoading, championships.length, pools.length]);

  // Disable change states when data arrives
  useEffect(() => {
    if (isChangingPool && days.length > 0) {
      setIsChangingPool(false);
    }
  }, [isChangingPool, days.length]);

  useEffect(() => {
    if (isChangingDay && matches.length > 0) {
      setIsChangingDay(false);
    }
  }, [isChangingDay, matches.length]);

  return {
    // State
    currentSeason,
    selectedChampionshipId: effectiveChampionshipId,
    selectedPoolId: effectivePoolId,
    selectedDayId: effectiveDayId,

    // Data
    championships,
    pools,
    days,
    matches,
    rankings: [], // Not implemented yet

    // Loading states
    loading: {
      championships: initialLoading,
      pools: initialLoading,
      days: poolLoading,
      matches: poolLoading,
      rankings: false,
    },
    initialLoading: initialLoading && !hasInitialData,
    poolsAreLoading: false, // Not necessary
    poolChangeLoading: isChangingPool || poolLoading,
    dayChangeLoading: isChangingDay || poolLoading,
    hasData:
      !initialLoading &&
      championships.length > 0 &&
      pools.length > 0 &&
      days.length > 0,
    hasPools: !initialLoading && championships.length > 0 && pools.length > 0,

    // Errors
    errors: {
      championships: (initialError as Error)?.message || null,
      pools: null, // No specific error for pools
      days: (poolError as Error)?.message || null,
      matches: (poolError as Error)?.message || null,
      rankings: null,
    },

    // Handlers
    handleSeasonChange,
    handleChampionshipChange,
    handlePoolChange,
    handleDayChange,

    // Utilities
    refetch: () => {
      // Refetch initial data and pool
      // Note: React Query automatically handles the refetch
    },
  };
}
