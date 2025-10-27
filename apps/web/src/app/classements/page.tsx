"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";

import { ChampionshipSelector } from "../../components/ChampionshipSelector";
import { PoolSelector } from "../../components/PoolSelector";
import { SeasonSelector } from "../../components/SeasonSelector";
import { useRankingsDirect } from "../../hooks/useRankingsDirect";
import {
  useChampionshipsOptimized,
  usePoolsOptimized,
} from "../../hooks/useSupabaseOptimized";

import { Ranking } from "@/lib/fffa-api";

const Rankings = () => {
  const [seasons] = useState<number[]>([2026]);
  const [currentSeason, setCurrentSeason] = useState<number>(2026);
  const [selectedChampionshipId, setSelectedChampionshipId] =
    useState<number>(0);
  const [selectedPoolId, setSelectedPoolId] = useState<number>(0);

  const {
    data: championshipsData,
    isLoading: championshipsLoading,
    error: championshipsError,
  } = useChampionshipsOptimized();

  const championships =
    championshipsData?.data?.map(c => ({
      id: c.id,
      label: c.name,
      male: true, // Valeur par défaut
      season: parseInt(c.season),
    })) || [];

  const effectiveChampionshipId = useMemo(() => {
    if (selectedChampionshipId > 0) return selectedChampionshipId;
    return championships.length > 0 ? championships[0].id : 0;
  }, [selectedChampionshipId, championships]);

  const {
    data: poolsData,
    isLoading: poolsLoading,
    error: poolsError,
  } = usePoolsOptimized(
    effectiveChampionshipId > 0 ? effectiveChampionshipId : 0
  );

  const pools =
    poolsData?.data?.map(p => ({
      id: p.id,
      label: p.name,
      championship_id: p.championship_id,
      phase_id: p.id, // Utiliser l'ID de la poule comme phase_id
    })) || [];

  const effectivePoolId = useMemo(() => {
    if (selectedPoolId > 0) return selectedPoolId;
    return pools.length > 0 ? pools[0].id : 0;
  }, [selectedPoolId, pools]);

  const {
    data: rankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useRankingsDirect(effectivePoolId);

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
    setCurrentSeason(parseInt(season));
  }, []);

  const handleChampionshipChange = useCallback((championshipId: string) => {
    setSelectedChampionshipId(parseInt(championshipId));
    setSelectedPoolId(0); // Reset pool selection
  }, []);

  const handlePoolChange = useCallback((poolId: string) => {
    setSelectedPoolId(parseInt(poolId));
  }, []);

  const initialLoading = championshipsLoading && championships.length === 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Classements Flag Football
          </h1>
          <p className="text-white/70 text-lg">
            Suivez les performances des équipes en Championnat de France
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

            {effectiveChampionshipId > 0 && (
              <PoolSelector
                pools={pools}
                selectedPoolId={effectivePoolId}
                onPoolChange={handlePoolChange}
                loading={poolsLoading}
              />
            )}
          </div>

          {effectivePoolId > 0 ? (
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Classement de la poule
              </h2>

              <div className="space-y-4">
                {initialLoading && (!rankings || rankings.length === 0) ? (
                  <div className="text-center py-8">
                    <div className="text-white/60 text-sm">
                      Chargement du classement...
                    </div>
                  </div>
                ) : !rankingsLoading && rankings && rankings.length > 0 ? (
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
                              key={`ranking-${index}`}
                              className="border-b border-white/10 hover:bg-white/5"
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
