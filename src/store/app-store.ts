import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Interface for application state
interface AppState {
  // État actuel
  currentSeason: number;
  selectedChampionshipId: number;
  selectedPoolId: number;
  selectedDayId: number;

  // Actions
  setSeason: (season: number) => void;
  setChampionship: (id: number) => void;
  setPool: (id: number) => void;
  setDay: (id: number) => void;

  // Reset actions
  resetSelections: () => void;
  resetAfterSeasonChange: () => void;
  resetAfterChampionshipChange: () => void;
}

// Main store with Zustand
export const useAppStore = create<AppState>()(
  devtools(
    set => ({
      // Initial state
      currentSeason: 2026,
      selectedChampionshipId: 0,
      selectedPoolId: 0,
      selectedDayId: 0,

      // Actions
      setSeason: season => {
        set(
          {
            currentSeason: season,
            selectedChampionshipId: 0,
            selectedPoolId: 0,
            selectedDayId: 0,
          },
          false,
          "setSeason"
        );
      },

      setChampionship: id => {
        set(
          {
            selectedChampionshipId: id,
            selectedPoolId: 0,
            selectedDayId: 0,
          },
          false,
          "setChampionship"
        );
      },

      setPool: id => {
        set(
          {
            selectedPoolId: id,
            selectedDayId: 0,
          },
          false,
          "setPool"
        );
      },

      setDay: id => {
        set({ selectedDayId: id }, false, "setDay");
      },

      // Reset actions
      resetSelections: () => {
        set(
          {
            selectedChampionshipId: 0,
            selectedPoolId: 0,
            selectedDayId: 0,
          },
          false,
          "resetSelections"
        );
      },

      resetAfterSeasonChange: () => {
        set(
          {
            selectedChampionshipId: 0,
            selectedPoolId: 0,
            selectedDayId: 0,
          },
          false,
          "resetAfterSeasonChange"
        );
      },

      resetAfterChampionshipChange: () => {
        set(
          {
            selectedPoolId: 0,
            selectedDayId: 0,
          },
          false,
          "resetAfterChampionshipChange"
        );
      },
    }),
    {
      name: "app-store", // Name for DevTools
    }
  )
);

// Optimized selectors to avoid unnecessary re-renders
export const useCurrentSeason = () => useAppStore(state => state.currentSeason);
export const useSelectedChampionshipId = () =>
  useAppStore(state => state.selectedChampionshipId);
export const useSelectedPoolId = () =>
  useAppStore(state => state.selectedPoolId);
export const useSelectedDayId = () => useAppStore(state => state.selectedDayId);

// Sélecteurs d'actions
export const useAppActions = () =>
  useAppStore(state => ({
    setSeason: state.setSeason,
    setChampionship: state.setChampionship,
    setPool: state.setPool,
    setDay: state.setDay,
    resetSelections: state.resetSelections,
    resetAfterSeasonChange: state.resetAfterSeasonChange,
    resetAfterChampionshipChange: state.resetAfterChampionshipChange,
  }));
