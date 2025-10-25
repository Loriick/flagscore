"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useAppDataSupabase } from "../hooks/useAppDataSupabase";

import { ChampionshipSelector } from "./ChampionshipSelector";
import { DeflagLoader } from "./DeflagLoader";
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
    hasPools,

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

        {hasPools && (
          <PoolSelector
            pools={pools}
            selectedPoolId={selectedPoolId}
            onPoolChange={handlePoolChange}
            loading={poolChangeLoading}
          />
        )}
      </div>

      {initialLoading && (
        <div className="text-center py-8">
          <DeflagLoader />
          <div className="text-white/60 text-sm mt-2">Chargement...</div>
        </div>
      )}

      {!initialLoading && (!hasPools || (hasPools && days.length === 0)) && (
        <div className="text-center py-8">
          <DeflagLoader />
          <div className="text-white/60 text-sm mt-2">
            {!hasPools
              ? "Chargement des poules..."
              : hasPools && days.length === 0
                ? poolChangeLoading
                  ? "Chargement des données de la poule..."
                  : "Chargement des journées..."
                : null}
          </div>
        </div>
      )}

      {!initialLoading && hasPools && days.length > 0 && (
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

          <OptimizedMatchesList
            matches={matches}
            loading={poolChangeLoading}
            data-testid="matches-list"
          />
        </div>
      )}
    </div>
  );
}
