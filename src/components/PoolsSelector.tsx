"use client";

import Image from "next/image";
import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";

import { Day } from "../app/types";
import { useChampionships } from "../hooks/useChampionships";
import { useMatches } from "../hooks/useMatches";
import { usePools } from "../hooks/usePools";
import { usePrefetch } from "../hooks/usePrefetch";

import { ChampionshipSelector } from "./ChampionshipSelector";
import { DaysNavigation } from "./DaysNavigation";
import { MatchesList } from "./MatchesList";
import { PoolSelector } from "./PoolSelector";
import { SeasonSelector } from "./SeasonSelector";
import { SkeletonLoader } from "./SkeletonLoader";

export function PoolsSelector() {
  const [seasons] = useState<number[]>([2026]);
  const [currentSeason, setCurrentSeason] = useState<number>(2026);
  const [selectedChampionshipId, setSelectedChampionshipId] =
    useState<number>(0);
  const [selectedPoolId, setSelectedPoolId] = useState<number>(0);

  const { prefetchRankings, prefetchPools, prefetchMatches } = usePrefetch();

  const {
    championships,
    loading: championshipsLoading,
    error: championshipsError,
  } = useChampionships(currentSeason);

  const effectiveChampionshipId = useMemo(() => {
    if (selectedChampionshipId > 0) return selectedChampionshipId;
    return championships.length > 0 ? championships[0].id : 0;
  }, [selectedChampionshipId, championships]);

  const {
    pools,
    loading: poolsLoading,
    error: poolsError,
  } = usePools(effectiveChampionshipId);

  const effectivePoolId = useMemo(() => {
    if (selectedPoolId > 0) return selectedPoolId;
    return pools.length > 0 ? pools[0].id : 0;
  }, [selectedPoolId, pools]);

  const {
    days,
    matches,
    loading: matchesLoading,
    error: matchesError,
    cached: matchesCached,
  } = useMatches(effectivePoolId);

  useEffect(() => {
    if (championshipsError) {
      toast.error("Erreur de chargement des compétitions", {
        description: championshipsError,
      });
    }
  }, [championshipsError]);

  useEffect(() => {
    if (poolsError) {
      toast.error("Erreur de chargement des poules", {
        description: poolsError,
      });
    }
  }, [poolsError]);

  useEffect(() => {
    if (matchesError) {
      toast.error("Erreur de chargement des matchs", {
        description: matchesError,
      });
    }
  }, [matchesError]);

  const handleSeasonChange = useCallback((season: string) => {
    setCurrentSeason(Number(season));
  }, []);

  const handleChampionshipChange = useCallback((championshipId: string) => {
    setSelectedChampionshipId(Number(championshipId));
    setSelectedPoolId(0);
  }, []);

  const handlePoolChange = useCallback((poolId: string) => {
    setSelectedPoolId(Number(poolId));
  }, []);

  useEffect(() => {
    if (pools.length > 0) {
      pools.slice(0, 3).forEach((pool) => {
        prefetchRankings(pool.id);
        prefetchMatches(pool.id);
      });
    }
  }, [pools, prefetchRankings, prefetchMatches]);

  useEffect(() => {
    if (effectiveChampionshipId > 0) {
      prefetchPools(effectiveChampionshipId);
    }
  }, [effectiveChampionshipId, prefetchPools]);

  const handleDaySelect = useCallback((day: Day) => {
    console.log("Journée sélectionnée:", day);
    // TODO: Implémenter la logique de sélection de journée
  }, []);

  const initialLoading = useMemo(
    () => championshipsLoading && championships.length === 0,
    [championshipsLoading, championships.length]
  );

  const poolsAreLoading = useMemo(() => poolsLoading, [poolsLoading]);

  const hasPools = useMemo(
    () => championships.length > 0 && pools.length > 0,
    [championships.length, pools.length]
  );

  const shouldShowNoPoolsMessage = useMemo(
    () =>
      !initialLoading &&
      !poolsAreLoading &&
      !championshipsLoading &&
      effectiveChampionshipId > 0 &&
      pools.length === 0,
    [
      initialLoading,
      poolsAreLoading,
      championshipsLoading,
      effectiveChampionshipId,
      pools.length,
    ]
  );

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
            selectedChampionshipId={effectiveChampionshipId}
            onChampionshipChange={handleChampionshipChange}
            loading={championshipsLoading}
          />
        </div>
      </div>

      {(initialLoading || poolsAreLoading) && <SkeletonLoader />}

      {!initialLoading && !poolsAreLoading && hasPools && (
        <div>
          {days.length > 0 ? (
            <DaysNavigation days={days} onDaySelect={handleDaySelect} />
          ) : !matchesLoading ? (
            <div className="mb-4">
              <div className="text-white text-center">
                <Image
                  src="/404.png"
                  alt="Aucune journée trouvée"
                  className="w-16 h-16 mx-auto mb-2 opacity-60"
                  width={100}
                  height={100}
                />
                <div>Aucune journée trouvée pour cette poule</div>
              </div>
            </div>
          ) : null}
          <PoolSelector
            pools={pools}
            selectedPoolId={effectivePoolId}
            onPoolChange={handlePoolChange}
            loading={poolsLoading}
          />
          <div className="relative">
            <MatchesList matches={matches} loading={matchesLoading} />
          </div>
        </div>
      )}

      {shouldShowNoPoolsMessage && (
        <div className="text-center py-8">
          <div className="text-white">
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
    </div>
  );
}
