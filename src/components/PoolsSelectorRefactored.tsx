"use client";

import Image from "next/image";
import { useState, useCallback, useMemo } from "react";

import { Day } from "../app/types";
import { useChampionships } from "../hooks/useChampionships";
import { useMatches } from "../hooks/useMatches";
import { usePools } from "../hooks/usePools";

import { ChampionshipSelector } from "./ChampionshipSelector";
import { DaysNavigation } from "./DaysNavigation";
import { MatchesList } from "./MatchesList";
import { PoolSelector } from "./PoolSelector";
import { SeasonSelector } from "./SeasonSelector";
import { SkeletonLoader } from "./SkeletonLoader";


export function PoolsSelector() {
  const [seasons] = useState<number[]>([2026]);
  const [currentSeason, setCurrentSeason] = useState<number>(2026);

  const {
    championships,
    loading: championshipsLoading,
    error: championshipsError,
  } = useChampionships(currentSeason);

  const selectedChampionshipId = useMemo(() => {
    return championships.length > 0 ? championships[0].id : 0;
  }, [championships]);

  const {
    pools,
    loading: poolsLoading,
    error: poolsError,
  } = usePools(selectedChampionshipId);

  const selectedPoolId = useMemo(() => {
    return pools.length > 0 ? pools[0].id : 0;
  }, [pools]);

  const {
    days,
    matches,
    loading: matchesLoading,
    error: matchesError,
  } = useMatches(selectedPoolId);

  const handleSeasonChange = useCallback((season: string) => {
    setCurrentSeason(Number(season));
  }, []);

  const handleChampionshipChange = useCallback((championshipId: string) => {
    // TODO: Implémenter la logique de changement de compétition
    console.log("Championship changed:", championshipId);
  }, []);

  const handlePoolChange = useCallback((poolId: string) => {
    // TODO: Implémenter la logique de changement de poule
    console.log("Pool changed:", poolId);
  }, []);

  const handleDaySelect = useCallback((day: Day) => {
    console.log("Journée sélectionnée:", day);
    // TODO: Implémenter la logique de sélection de journée
  }, []);

  const initialLoading = championshipsLoading && championships.length === 0;
  const hasData =
    championships.length > 0 && pools.length > 0 && days.length > 0;

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
            loading={championshipsLoading}
          />
        </div>
      </div>

      {initialLoading && <SkeletonLoader />}

      {!initialLoading && hasData && (
        <div>
          <DaysNavigation days={days} onDaySelect={handleDaySelect} />
          <PoolSelector
            pools={pools}
            selectedPoolId={selectedPoolId}
            onPoolChange={handlePoolChange}
            loading={poolsLoading}
          />
          <MatchesList matches={matches} loading={matchesLoading} />
        </div>
      )}

      {championshipsError && (
        <div className="text-center py-8">
          <div className="text-red-400">Erreur: {championshipsError}</div>
        </div>
      )}

      {poolsError && (
        <div className="text-center py-8">
          <div className="text-red-400">Erreur: {poolsError}</div>
        </div>
      )}

      {matchesError && (
        <div className="text-center py-8">
          <div className="text-red-400">Erreur: {matchesError}</div>
        </div>
      )}

      {!initialLoading &&
        !championshipsLoading &&
        selectedChampionshipId > 0 &&
        pools.length === 0 && (
          <div className="text-center py-8">
            <Image
              src="/404.png"
              alt="Aucune poule trouvée"
              width={100}
              height={100}
            />
            <div className="text-white/60">
              Aucune poule trouvée pour cette compétition
            </div>
          </div>
        )}
    </div>
  );
}
