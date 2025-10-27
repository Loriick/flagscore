"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useAppDataSupabase } from "../hooks/useAppDataSupabase";

import { ChampionshipSelector } from "./ChampionshipSelector";
import { DaysNavigation } from "./organisms/DaysNavigation";
import { OptimizedMatchesList } from "./organisms/OptimizedMatchesList";
import { PoolSelector } from "./PoolSelector";
import { SeasonSelector } from "./SeasonSelector";

export function PoolsSelector() {
  const seasons = [2026]; // Available seasons

  const {
    // State
    currentSeason,
    selectedChampionshipId,
    selectedPoolId,
    selectedDayId,

    // Data
    championships,
    pools,
    days,
    matches,

    // Loading states
    loading,
    initialLoading,
    poolChangeLoading,

    // Errors
    errors,

    // Handlers
    handleSeasonChange,
    handleChampionshipChange,
    handlePoolChange,
    handleDayChange,
  } = useAppDataSupabase();

  // Gestion des erreurs avec notifications - seulement pour les vraies erreurs
  useEffect(() => {
    if (errors.championships && !initialLoading) {
      if (
        errors.championships.includes("too many requests") ||
        errors.championships.includes("rate limit")
      ) {
        toast.error("Trop de requêtes - Veuillez patienter", {
          description:
            "L'API est temporairement limitée. Réessayez dans quelques minutes.",
          duration: 10000,
        });
      } else {
        toast.error("Erreur de chargement des compétitions", {
          description: errors.championships,
        });
      }
    }
  }, [errors.championships, initialLoading]);

  useEffect(() => {
    if (errors.pools && !initialLoading) {
      toast.error("Erreur de chargement des poules", {
        description: errors.pools,
      });
    }
  }, [errors.pools, initialLoading]);

  useEffect(() => {
    if (errors.matches) {
      toast.error("Erreur de chargement des matchs", {
        description: errors.matches,
      });
    }
  }, [errors.matches]);

  useEffect(() => {
    if (errors.rankings) {
      toast.error("Erreur de chargement des classements", {
        description: errors.rankings,
      });
    }
  }, [errors.rankings]);

  return (
    <div className="w-full max-w-md mx-auto py-4 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
      <div className="space-y-4 mb-8">
        <div className="flex flex-row items-end gap-2 sm:gap-4">
          <SeasonSelector
            seasons={seasons}
            currentSeason={currentSeason}
            onSeasonChange={handleSeasonChange}
          />
          <ChampionshipSelector
            championships={championships}
            selectedChampionshipId={selectedChampionshipId}
            onChampionshipChange={handleChampionshipChange}
            loading={loading.championships}
          />
        </div>

        {/* Pool Selector - toujours affiché avec état de chargement */}
        <PoolSelector
          pools={pools}
          selectedPoolId={selectedPoolId}
          onPoolChange={handlePoolChange}
          loading={loading.pools || poolChangeLoading}
        />
      </div>

      {/* Days Navigation - affiché seulement si on a des jours */}
      {selectedPoolId > 0 && days.length > 0 && (
        <div>
          <DaysNavigation
            days={days}
            onDaySelect={day => handleDayChange(day.id.toString())}
            data-testid="days-navigation"
          />

          {/* Date réelle du jour sélectionné */}
          {selectedDayId > 0 && (
            <div className="mt-4 mb-2">
              <h3 className="text-lg font-medium text-white">
                {(() => {
                  const selectedDay = days.find(
                    day => day.id === selectedDayId
                  );
                  if (selectedDay && selectedDay.date) {
                    return new Date(selectedDay.date).toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    );
                  }
                  return "";
                })()}
              </h3>
            </div>
          )}

          {/* Matchs - affichés seulement si un jour est sélectionné */}
          {selectedDayId > 0 && (
            <OptimizedMatchesList
              matches={matches}
              loading={loading.matches}
              data-testid="matches-list"
            />
          )}
        </div>
      )}

      {/* États de chargement et messages - logique exclusive stricte */}
      {initialLoading ? (
        <div className="text-center py-8">
          <div className="text-white/60 text-sm">Chargement...</div>
        </div>
      ) : championships.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-white/60 text-sm">
            Aucune compétition disponible
          </div>
        </div>
      ) : selectedPoolId === 0 ? (
        <div className="text-center py-8">
          <div className="text-white/60 text-sm">
            Sélectionnez une poule pour voir les journées et matchs
          </div>
        </div>
      ) : selectedPoolId > 0 && days.length === 0 && loading.days ? (
        <div className="text-center py-8">
          <div className="text-white/60 text-sm">
            Chargement des journées...
          </div>
        </div>
      ) : selectedPoolId > 0 && days.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-white/60 text-sm">Aucune journée disponible</div>
        </div>
      ) : null}
    </div>
  );
}
