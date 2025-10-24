import { useCallback, useState, useEffect } from "react";

import { useCompleteData } from "./useCompleteData";
import { usePoolData } from "./usePoolData";

export function useAppDataSimple() {
  const [currentSeason, setCurrentSeason] = useState(2026);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState(0);
  const [selectedPoolId, setSelectedPoolId] = useState(0);
  const [selectedDayId, setSelectedDayId] = useState(0);

  // États de chargement spécifiques pour chaque changement
  const [isChangingPool, setIsChangingPool] = useState(false);
  const [isChangingDay, setIsChangingDay] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Données initiales (championnats + poules) avec gestion d'erreur
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

  // Utiliser les IDs sélectionnés par l'API si pas de sélection manuelle
  const effectiveChampionshipId =
    selectedChampionshipId > 0
      ? selectedChampionshipId
      : initialData?.selectedChampionshipId || 0;
  const effectivePoolId =
    selectedPoolId > 0 ? selectedPoolId : initialData?.selectedPoolId || 0;

  // Données de poule spécifiques (jours + matchs) avec gestion d'erreur
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

  // Marquer qu'on a des données initiales
  useEffect(() => {
    if (!initialLoading && championships.length > 0 && pools.length > 0) {
      setHasInitialData(true);
    }
  }, [initialLoading, championships.length, pools.length]);

  // Désactiver les états de changement quand les données arrivent
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
    rankings: [], // Pas encore implémenté

    // États de chargement
    loading: {
      championships: initialLoading,
      pools: initialLoading,
      days: poolLoading,
      matches: poolLoading,
      rankings: false,
    },
    initialLoading: initialLoading && !hasInitialData,
    poolsAreLoading: false, // Plus nécessaire
    poolChangeLoading: isChangingPool || poolLoading,
    dayChangeLoading: isChangingDay || poolLoading,
    hasData:
      !initialLoading &&
      championships.length > 0 &&
      pools.length > 0 &&
      days.length > 0,
    hasPools: !initialLoading && championships.length > 0 && pools.length > 0,

    // Erreurs
    errors: {
      championships: (initialError as Error)?.message || null,
      pools: null, // Pas d'erreur spécifique pour les poules
      days: (poolError as Error)?.message || null,
      matches: (poolError as Error)?.message || null,
      rankings: null,
    },

    // Handlers
    handleSeasonChange,
    handleChampionshipChange,
    handlePoolChange,
    handleDayChange,

    // Utilitaires
    refetch: () => {
      // Refetch des données initiales et de poule
      // Note: React Query gère automatiquement le refetch
    },
  };
}
