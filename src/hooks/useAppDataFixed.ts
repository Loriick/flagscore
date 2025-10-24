import { useCallback, useEffect, useMemo } from "react";

import { useChampionships as useChampionshipsHook } from "../hooks/useChampionships";
import { useMatches as useMatchesHook } from "../hooks/useMatches";
import { usePools as usePoolsHook } from "../hooks/usePools";
import { useRankings as useRankingsHook } from "../hooks/useRankings";
import { useAppStore, useAppActions } from "../store/app-store";
import { useDataStore, useDataActions } from "../store/data-store";

// Hook principal qui unifie tous les stores et hooks
export function useAppData() {
  // État de l'application
  const {
    currentSeason,
    selectedChampionshipId,
    selectedPoolId,
    selectedDayId,
  } = useAppStore();

  // Actions de l'application
  const {
    setSeason,
    setChampionship,
    setPool,
    setDay,
    resetSelections,
    resetAfterSeasonChange,
    resetAfterChampionshipChange,
  } = useAppActions();

  // Actions des données
  const {
    setChampionships,
    setPools,
    setDays,
    setMatches,
    setRankings,
    setLoading,
    setError,
  } = useDataActions();

  // Hooks existants pour la logique de fetching
  const {
    data: fetchedChampionships = [],
    isLoading: championshipsLoading,
    error: championshipsError,
  } = useChampionshipsHook(currentSeason);

  const {
    data: fetchedPools = [],
    isLoading: poolsLoading,
    error: poolsError,
  } = usePoolsHook(selectedChampionshipId);

  const {
    data: matchesData,
    isLoading: matchesLoading,
    error: matchesError,
  } = useMatchesHook(selectedPoolId);

  const fetchedDays = matchesData?.days || [];
  const fetchedMatches = matchesData?.matches || [];

  const {
    data: rankingsData,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useRankingsHook(selectedPoolId);

  const fetchedRankings = rankingsData?.rankings || [];

  // Synchronisation des données avec les stores (une seule fois)
  useEffect(() => {
    if (fetchedChampionships.length > 0) {
      setChampionships(currentSeason, fetchedChampionships);
    }
  }, [fetchedChampionships, currentSeason, setChampionships]);

  useEffect(() => {
    if (fetchedPools.length > 0) {
      setPools(selectedChampionshipId, fetchedPools);
    }
  }, [fetchedPools, selectedChampionshipId, setPools]);

  useEffect(() => {
    if (fetchedDays && fetchedDays.length > 0) {
      setDays(selectedPoolId, fetchedDays);
    }
  }, [fetchedDays, selectedPoolId, setDays]);

  useEffect(() => {
    if (fetchedMatches && fetchedMatches.length > 0) {
      setMatches(selectedDayId, fetchedMatches);
    }
  }, [fetchedMatches, selectedDayId, setMatches]);

  useEffect(() => {
    if (fetchedRankings.length > 0) {
      setRankings(selectedPoolId, fetchedRankings);
    }
  }, [fetchedRankings, selectedPoolId, setRankings]);

  // Synchronisation des états de chargement
  useEffect(() => {
    setLoading("championships", championshipsLoading);
  }, [championshipsLoading, setLoading]);

  useEffect(() => {
    setLoading("pools", poolsLoading);
  }, [poolsLoading, setLoading]);

  useEffect(() => {
    setLoading("days", matchesLoading);
    setLoading("matches", matchesLoading);
  }, [matchesLoading, setLoading]);

  useEffect(() => {
    setLoading("rankings", rankingsLoading);
  }, [rankingsLoading, setLoading]);

  // Synchronisation des erreurs
  useEffect(() => {
    setError("championships", championshipsError?.message || null);
  }, [championshipsError, setError]);

  useEffect(() => {
    setError("pools", poolsError?.message || null);
  }, [poolsError, setError]);

  useEffect(() => {
    setError("days", matchesError?.message || null);
    setError("matches", matchesError?.message || null);
  }, [matchesError, setError]);

  useEffect(() => {
    setError("rankings", rankingsError?.message || null);
  }, [rankingsError, setError]);

  // Données depuis les stores
  const championships = useDataStore(
    state => state.championships[currentSeason] || []
  );
  const pools = useDataStore(
    state => state.pools[selectedChampionshipId] || []
  );
  const days = useDataStore(state => state.days[selectedPoolId] || []);
  const matches = useDataStore(state => state.matches[selectedDayId] || []);
  const rankings = useDataStore(state => state.rankings[selectedPoolId] || []);

  // États de chargement depuis les stores
  const loading = useDataStore(state => state.loading);
  const errors = useDataStore(state => state.errors);

  // Logique de sélection automatique
  const effectiveChampionshipId = useMemo(() => {
    if (selectedChampionshipId > 0) return selectedChampionshipId;
    return championships.length > 0 ? championships[0].id : 0;
  }, [selectedChampionshipId, championships]);

  const effectivePoolId = useMemo(() => {
    if (selectedPoolId > 0) return selectedPoolId;
    return pools.length > 0 ? pools[0].id : 0;
  }, [selectedPoolId, pools]);

  const effectiveDayId = useMemo(() => {
    if (selectedDayId > 0) return selectedDayId;
    return days.length > 0 ? days[0].id : 0;
  }, [selectedDayId, days]);

  // Auto-sélection des valeurs par défaut (une seule fois)
  useEffect(() => {
    if (championships.length > 0 && selectedChampionshipId === 0) {
      setChampionship(championships[0].id);
    }
  }, [championships.length, selectedChampionshipId, setChampionship]);

  useEffect(() => {
    if (pools.length > 0 && selectedPoolId === 0) {
      setPool(pools[0].id);
    }
  }, [pools.length, selectedPoolId, setPool]);

  useEffect(() => {
    if (days.length > 0 && selectedDayId === 0) {
      setDay(days[0].id);
    }
  }, [days.length, selectedDayId, setDay]);

  // Handlers optimisés avec useCallback
  const handleSeasonChange = useCallback(
    (season: string) => {
      const seasonNum = Number(season);
      setSeason(seasonNum);
      resetAfterSeasonChange();
    },
    [setSeason, resetAfterSeasonChange]
  );

  const handleChampionshipChange = useCallback(
    (championshipId: string) => {
      const id = Number(championshipId);
      setChampionship(id);
      resetAfterChampionshipChange();
    },
    [setChampionship, resetAfterChampionshipChange]
  );

  const handlePoolChange = useCallback(
    (poolId: string) => {
      const id = Number(poolId);
      setPool(id);
    },
    [setPool]
  );

  const handleDayChange = useCallback(
    (dayId: string) => {
      const id = Number(dayId);
      setDay(id);
    },
    [setDay]
  );

  // États calculés
  const initialLoading = useMemo(() => {
    return championshipsLoading && championships.length === 0;
  }, [championshipsLoading, championships.length]);

  const poolsAreLoading = useMemo(() => {
    return poolsLoading && pools.length === 0;
  }, [poolsLoading, pools.length]);

  const hasData = useMemo(() => {
    return championships.length > 0 && pools.length > 0 && days.length > 0;
  }, [championships.length, pools.length, days.length]);

  const hasPools = useMemo(() => {
    return championships.length > 0 && pools.length > 0;
  }, [championships.length, pools.length]);

  return {
    // État
    currentSeason,
    selectedChampionshipId: effectiveChampionshipId,
    selectedPoolId: effectivePoolId,
    selectedDayId: effectiveDayId,

    // Données
    championships,
    pools,
    days,
    matches,
    rankings,

    // États de chargement
    loading,
    initialLoading,
    poolsAreLoading,
    hasData,
    hasPools,

    // Erreurs
    errors,

    // Handlers
    handleSeasonChange,
    handleChampionshipChange,
    handlePoolChange,
    handleDayChange,

    // Actions directes
    setSeason,
    setChampionship,
    setPool,
    setDay,
    resetSelections,
  };
}
