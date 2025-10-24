"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";

import { ChampionshipSelector } from "../../components/ChampionshipSelector";
import { DeflagLoader } from "../../components/DeflagLoader";
import { PoolSelector } from "../../components/PoolSelector";
import { SeasonSelector } from "../../components/SeasonSelector";
import { useChampionships } from "../../hooks/useChampionships";
import { useMatches } from "../../hooks/useMatches";
import { usePools } from "../../hooks/usePools";

import { useRankings } from "@/hooks/useRankings";
import { Ranking } from "@/lib/fffa-api";

const Rankings = () => {
  const [seasons] = useState<number[]>([2026]);
  const [currentSeason, setCurrentSeason] = useState<number>(2026);
  const [selectedChampionshipId, setSelectedChampionshipId] =
    useState<number>(0);
  const [selectedPoolId, setSelectedPoolId] = useState<number>(0);

  const {
    data: championships = [],
    isLoading: championshipsLoading,
    error: championshipsError,
  } = useChampionships(currentSeason);

  const effectiveChampionshipId = useMemo(() => {
    if (selectedChampionshipId > 0) return selectedChampionshipId;
    return championships.length > 0 ? championships[0].id : 0;
  }, [selectedChampionshipId, championships]);

  const {
    data: pools = [],
    isLoading: poolsLoading,
    error: poolsError,
  } = usePools(effectiveChampionshipId > 0 ? effectiveChampionshipId : 0);

  const effectivePoolId = useMemo(() => {
    if (selectedPoolId > 0) return selectedPoolId;
    return pools.length > 0 ? pools[0].id : 0;
  }, [selectedPoolId, pools]);

  useMatches(effectivePoolId > 0 ? effectivePoolId : 0);

  const {
    data: rankingsData,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useRankings(effectivePoolId > 0 ? effectivePoolId : 0);

  const rankings = rankingsData?.rankings || [];

  useEffect(() => {
    if (championshipsError) {
      toast.error("Erreur de chargement des compétitions", {
        description: championshipsError.message || "Erreur inconnue",
      });
    }
  }, [championshipsError]);

  useEffect(() => {
    if (poolsError) {
      toast.error("Erreur de chargement des poules", {
        description: poolsError.message || "Erreur inconnue",
      });
    }
  }, [poolsError]);

  useEffect(() => {
    if (rankingsError) {
      toast.error("Erreur de chargement des classements", {
        description: rankingsError.message || "Erreur inconnue",
      });
    }
  }, [rankingsError]);

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

  const initialLoading = championshipsLoading;
  const poolsAreLoading = poolsLoading && pools.length === 0;
  const hasPools = championships.length > 0 && pools.length > 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Classements Flag Football France
          </h1>
          <p className="text-lg text-white/80">
            Consultez les classements du championnat de France et de la coupe de
            France
          </p>
        </header>

        <main className="space-y-8">
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

            {hasPools && (
              <PoolSelector
                pools={pools}
                selectedPoolId={effectivePoolId}
                onPoolChange={handlePoolChange}
                loading={poolsLoading}
              />
            )}
          </div>

          {initialLoading || poolsAreLoading ? (
            <div className="text-center py-8">
              <DeflagLoader />
              <div className="text-white/60 text-sm mt-2">
                Chargement des données...
              </div>
            </div>
          ) : hasPools && effectivePoolId > 0 ? (
            <div className="space-y-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">
                    Classement de la poule
                  </h2>
                </div>

                {rankingsLoading ? (
                  <div className="text-center py-8">
                    <DeflagLoader />
                    <div className="text-white/60 text-sm mt-2">
                      Chargement du classement...
                    </div>
                  </div>
                ) : !rankingsLoading &&
                  !initialLoading &&
                  rankings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-4 font-medium">
                            Rang
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Équipe
                          </th>
                          <th className="text-center py-3 px-4 font-medium">
                            Pts
                          </th>
                          <th className="text-center py-3 px-4 font-medium">
                            J
                          </th>
                          <th className="text-center py-3 px-4 font-medium">
                            G
                          </th>
                          <th className="text-center py-3 px-4 font-medium">
                            N
                          </th>
                          <th className="text-center py-3 px-4 font-medium">
                            P
                          </th>
                          <th className="text-center py-3 px-4 font-medium">
                            +/-
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankings.map((ranking: Ranking, index: number) => {
                          const position = index + 1;

                          return (
                            <tr
                              key={`ranking-${ranking.club.id}-${index}`}
                              className="border-b border-white/10 hover:bg-white/5"
                              style={
                                position <= 2
                                  ? {
                                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                                      borderLeft: "4px solid #22c55e",
                                    }
                                  : {}
                              }
                            >
                              <td className="py-3 px-4 font-medium">
                                <span className="text-white text-sm">
                                  {position}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-white text-sm">
                                  {ranking.club.label}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-medium">
                                {ranking.points}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {ranking.j}
                              </td>
                              <td className="py-3 px-4 text-center text-green-400">
                                {ranking.g}
                              </td>
                              <td className="py-3 px-4 text-center text-yellow-400">
                                {ranking.n}
                              </td>
                              <td className="py-3 px-4 text-center text-red-400">
                                {ranking.p}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {ranking.points_diff}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Légende */}
                    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-sm font-medium text-white/80 mb-3">
                        Légende des qualifications
                      </h3>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded-full"></span>
                          <span className="text-green-300">
                            1er & 2ème : Qualifiés directement
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-gray-500/20 border border-gray-500/30 rounded-full"></span>
                          <span className="text-gray-400">
                            3ème et suivants : Éliminés
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/60">
                      Aucun classement disponible pour cette poule
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-white/60">
                Sélectionnez une compétition et une poule pour voir les
                classements
              </div>
            </div>
          )}

          <section className="p-6 bg-white/5 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              À propos des classements
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-white/70">
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">
                  Système de points
                </h3>
                <p>
                  Les équipes gagnent des points selon leurs performances :
                  victoire, défaite, et match nul. Le classement est mis à jour
                  après chaque journée de compétition.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">
                  Critères de classement
                </h3>
                <p>
                  En cas d&apos;égalité de points, les critères de départage
                  incluent la différence de points, les points marqués, et les
                  confrontations directes.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Rankings;
