import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { Championship, Pool, Day, Match, Ranking } from "../app/types";

// Interface pour l'état des données
interface DataState {
  // Cache des données
  championships: Record<number, Championship[]>;
  pools: Record<number, Pool[]>;
  days: Record<number, Day[]>;
  matches: Record<number, Match[]>;
  rankings: Record<number, Ranking[]>;

  // États de chargement
  loading: {
    championships: boolean;
    pools: boolean;
    days: boolean;
    matches: boolean;
    rankings: boolean;
  };

  // États d'erreur
  errors: {
    championships: string | null;
    pools: string | null;
    days: string | null;
    matches: string | null;
    rankings: string | null;
  };

  // Actions pour les données
  setChampionships: (season: number, data: Championship[]) => void;
  setPools: (championshipId: number, data: Pool[]) => void;
  setDays: (poolId: number, data: Day[]) => void;
  setMatches: (dayId: number, data: Match[]) => void;
  setRankings: (poolId: number, data: Ranking[]) => void;

  // Actions pour les états de chargement
  setLoading: (key: keyof DataState["loading"], loading: boolean) => void;
  setError: (key: keyof DataState["errors"], error: string | null) => void;

  // Actions de nettoyage
  clearChampionships: (season: number) => void;
  clearPools: (championshipId: number) => void;
  clearDays: (poolId: number) => void;
  clearMatches: (dayId: number) => void;
  clearRankings: (poolId: number) => void;

  // Actions de réinitialisation
  resetAll: () => void;
  resetLoading: () => void;
  resetErrors: () => void;
}

// Store de données avec Zustand
export const useDataStore = create<DataState>()(
  devtools(
    set => ({
      // État initial
      championships: {},
      pools: {},
      days: {},
      matches: {},
      rankings: {},

      loading: {
        championships: false,
        pools: false,
        days: false,
        matches: false,
        rankings: false,
      },

      errors: {
        championships: null,
        pools: null,
        days: null,
        matches: null,
        rankings: null,
      },

      // Actions pour les données
      setChampionships: (season, data) => {
        set(
          state => ({
            championships: {
              ...state.championships,
              [season]: data,
            },
            loading: {
              ...state.loading,
              championships: false,
            },
            errors: {
              ...state.errors,
              championships: null,
            },
          }),
          false,
          "setChampionships"
        );
      },

      setPools: (championshipId, data) => {
        set(
          state => ({
            pools: {
              ...state.pools,
              [championshipId]: data,
            },
            loading: {
              ...state.loading,
              pools: false,
            },
            errors: {
              ...state.errors,
              pools: null,
            },
          }),
          false,
          "setPools"
        );
      },

      setDays: (poolId, data) => {
        set(
          state => ({
            days: {
              ...state.days,
              [poolId]: data,
            },
            loading: {
              ...state.loading,
              days: false,
            },
            errors: {
              ...state.errors,
              days: null,
            },
          }),
          false,
          "setDays"
        );
      },

      setMatches: (dayId, data) => {
        set(
          state => ({
            matches: {
              ...state.matches,
              [dayId]: data,
            },
            loading: {
              ...state.loading,
              matches: false,
            },
            errors: {
              ...state.errors,
              matches: null,
            },
          }),
          false,
          "setMatches"
        );
      },

      setRankings: (poolId, data) => {
        set(
          state => ({
            rankings: {
              ...state.rankings,
              [poolId]: data,
            },
            loading: {
              ...state.loading,
              rankings: false,
            },
            errors: {
              ...state.errors,
              rankings: null,
            },
          }),
          false,
          "setRankings"
        );
      },

      // Actions pour les états de chargement
      setLoading: (key, loading) => {
        set(
          state => ({
            loading: {
              ...state.loading,
              [key]: loading,
            },
          }),
          false,
          "setLoading"
        );
      },

      setError: (key, error) => {
        set(
          state => ({
            errors: {
              ...state.errors,
              [key]: error,
            },
            loading: {
              ...state.loading,
              [key]: false,
            },
          }),
          false,
          "setError"
        );
      },

      // Actions de nettoyage
      clearChampionships: season => {
        set(
          state => {
            const newChampionships = { ...state.championships };
            delete newChampionships[season];
            return { championships: newChampionships };
          },
          false,
          "clearChampionships"
        );
      },

      clearPools: championshipId => {
        set(
          state => {
            const newPools = { ...state.pools };
            delete newPools[championshipId];
            return { pools: newPools };
          },
          false,
          "clearPools"
        );
      },

      clearDays: poolId => {
        set(
          state => {
            const newDays = { ...state.days };
            delete newDays[poolId];
            return { days: newDays };
          },
          false,
          "clearDays"
        );
      },

      clearMatches: dayId => {
        set(
          state => {
            const newMatches = { ...state.matches };
            delete newMatches[dayId];
            return { matches: newMatches };
          },
          false,
          "clearMatches"
        );
      },

      clearRankings: poolId => {
        set(
          state => {
            const newRankings = { ...state.rankings };
            delete newRankings[poolId];
            return { rankings: newRankings };
          },
          false,
          "clearRankings"
        );
      },

      // Actions de réinitialisation
      resetAll: () => {
        set(
          {
            championships: {},
            pools: {},
            days: {},
            matches: {},
            rankings: {},
            loading: {
              championships: false,
              pools: false,
              days: false,
              matches: false,
              rankings: false,
            },
            errors: {
              championships: null,
              pools: null,
              days: null,
              matches: null,
              rankings: null,
            },
          },
          false,
          "resetAll"
        );
      },

      resetLoading: () => {
        set(
          () => ({
            loading: {
              championships: false,
              pools: false,
              days: false,
              matches: false,
              rankings: false,
            },
          }),
          false,
          "resetLoading"
        );
      },

      resetErrors: () => {
        set(
          () => ({
            errors: {
              championships: null,
              pools: null,
              days: null,
              matches: null,
              rankings: null,
            },
          }),
          false,
          "resetErrors"
        );
      },
    }),
    {
      name: "data-store", // Nom pour les DevTools
    }
  )
);

// Sélecteurs optimisés pour les données
export const useChampionships = (season: number) =>
  useDataStore(state => state.championships[season] || []);

export const usePools = (championshipId: number) =>
  useDataStore(state => state.pools[championshipId] || []);

export const useDays = (poolId: number) =>
  useDataStore(state => state.days[poolId] || []);

export const useMatches = (dayId: number) =>
  useDataStore(state => state.matches[dayId] || []);

export const useRankings = (poolId: number) =>
  useDataStore(state => state.rankings[poolId] || []);

// Sélecteurs pour les états de chargement
export const useLoading = (key: keyof DataState["loading"]) =>
  useDataStore(state => state.loading[key]);

export const useError = (key: keyof DataState["errors"]) =>
  useDataStore(state => state.errors[key]);

// Sélecteurs pour les actions
export const useDataActions = () =>
  useDataStore(state => ({
    setChampionships: state.setChampionships,
    setPools: state.setPools,
    setDays: state.setDays,
    setMatches: state.setMatches,
    setRankings: state.setRankings,
    setLoading: state.setLoading,
    setError: state.setError,
    clearChampionships: state.clearChampionships,
    clearPools: state.clearPools,
    clearDays: state.clearDays,
    clearMatches: state.clearMatches,
    clearRankings: state.clearRankings,
    resetAll: state.resetAll,
    resetLoading: state.resetLoading,
    resetErrors: state.resetErrors,
  }));
