"use client";

import Image from "next/image";
import { useEffect } from "react";
import { toast } from "sonner";

import { useAppData } from "../hooks/useAppData";

import { ChampionshipSelector } from "./ChampionshipSelector";
import { DaysNavigation } from "./DaysNavigation";
import { MatchesList } from "./MatchesList";
import { PoolSelector } from "./PoolSelector";
import { SeasonSelector } from "./SeasonSelector";
import { SkeletonLoader } from "./SkeletonLoader";

export function PoolsSelector() {
  const seasons = [2026]; // Saisons disponibles

  const {
    // État
    currentSeason,
    selectedChampionshipId,
    selectedPoolId,

    // Données
    championships,
    pools,
    days,
    matches,

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
  } = useAppData();

  // Gestion des erreurs avec notifications
  useEffect(() => {
    if (errors.championships) {
      toast.error("Erreur de chargement des compétitions", {
        description: errors.championships,
      });
    }
  }, [errors.championships]);

  useEffect(() => {
    if (errors.pools) {
      toast.error("Erreur de chargement des poules", {
        description: errors.pools,
      });
    }
  }, [errors.pools]);

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
            loading={loading.pools}
          />
        )}
      </div>

      {initialLoading && <SkeletonLoader />}

      {!initialLoading && hasData && (
        <div>
          <DaysNavigation
            days={days}
            onDaySelect={day => handleDayChange(day.id.toString())}
          />
          <MatchesList matches={matches} loading={loading.matches} />
        </div>
      )}

      {!initialLoading && !poolsAreLoading && !hasPools && (
        <div className="text-center py-8">
          <div className="text-white/60">
            <Image
              src="/404.png"
              alt="Aucune poule trouvée"
              className="w-16 h-16 mx-auto mb-2 opacity-60"
              width={100}
              height={100}
            />
            Aucune poule trouvée pour cette compétition
          </div>
        </div>
      )}

      {!initialLoading && !hasData && days.length === 0 && (
        <div className="text-center py-8">
          <div className="text-white/60">
            <Image
              src="/404.png"
              alt="Aucune journée trouvée"
              className="w-16 h-16 mx-auto mb-2 opacity-60"
              width={100}
              height={100}
            />
            Aucune journée trouvée pour cette poule
          </div>
        </div>
      )}
    </div>
  );
}
