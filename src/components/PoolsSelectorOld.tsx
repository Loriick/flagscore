"use client";

import { useState, useEffect } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Championship, Pool, Day, Match, Ranking } from "../app/types";
import {
  getChampionships,
  getPhases,
  getPools,
  getDays,
  getMatches,
  getRankings,
} from "../lib/fffa-api";

import { SkeletonLoader } from "./SkeletonLoader";

export function PoolsSelector() {
  const [seasons] = useState<number[]>([2026]);
  const [currentSeason, setCurrentSeason] = useState<number>(2026);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selectedChampionshipId, setSelectedChampionshipId] =
    useState<number>(0);
  const [pools, setPools] = useState<Pool[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [openPools, setOpenPools] = useState<Set<number>>(new Set());
  const [selectedPoolId, setSelectedPoolId] = useState<number>(0);

  // Charger les compétitions pour 2026 au montage du composant
  useEffect(() => {
    const fetchChampionships = async () => {
      setInitialLoading(true);
      try {
        const championshipsData = await getChampionships(2026);
        setChampionships(championshipsData);
        if (championshipsData.length > 0) {
          setSelectedChampionshipId(championshipsData[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des compétitions:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChampionships();
  }, []);

  // Charger les pools quand la compétition change
  useEffect(() => {
    const fetchPools = async () => {
      if (!selectedChampionshipId) {
        setPools([]);
        return;
      }

      setLoading(true);
      try {
        // 1. Récupérer les phases de la compétition
        const phases = await getPhases(selectedChampionshipId);
        console.log("Phases récupérées:", phases);

        // 2. Récupérer toutes les pools seulement
        const allPools: Pool[] = [];

        // Récupérer toutes les pools de toutes les phases
        for (const phase of phases) {
          try {
            const phasePools = await getPools(phase.id);
            allPools.push(...phasePools);
          } catch (error) {
            console.error(`Erreur pools pour phase ${phase.id}:`, error);
          }
        }

        setPools(allPools);
        setSelectedPoolId(allPools.length > 0 ? allPools[0].id : 0);
        console.log("Pools récupérées:", allPools);
      } catch (error) {
        console.error("Erreur lors du chargement des pools:", error);
        setPools([]);
        setDays([]);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [selectedChampionshipId]);

  // Charger les journées et matchs quand la pool sélectionnée change
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!selectedPoolId) {
        setDays([]);
        setMatches([]);
        return;
      }

      setLoading(true);
      try {
        // Récupérer les journées de la pool sélectionnée
        const poolDays = await getDays(selectedPoolId);
        setDays(poolDays);

        // Récupérer les matchs de la première journée
        if (poolDays.length > 0) {
          const firstDayMatches = await getMatches(poolDays[0].id);
          setMatches(firstDayMatches);
        } else {
          setMatches([]);
        }

        console.log("Données de la pool:", {
          poolId: selectedPoolId,
          days: poolDays,
          matches: poolDays.length > 0 ? await getMatches(poolDays[0].id) : [],
        });
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données de la pool:",
          error
        );
        setDays([]);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPoolData();
  }, [selectedPoolId]);

  const handleSeasonChange = (season: string) => {
    setCurrentSeason(Number(season));
  };

  const handleChampionshipChange = (championshipId: string) => {
    setSelectedChampionshipId(Number(championshipId));
  };

  return (
    <div className="w-full max-w-md mx-auto py-4 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
      {/* Sélecteurs */}
      <div className="space-y-4 mb-8">
        {/* Sélecteurs Saison et Compétition */}
        <div className="flex flex-row items-end gap-2 sm:gap-4">
          <div className="w-24 sm:w-36 space-y-2">
            <Label htmlFor="season" className="text-white/80">
              Saison
            </Label>
            <Select
              value={currentSeason.toString()}
              onValueChange={handleSeasonChange}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <SelectValue placeholder="Sélectionner une saison" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {seasons.map((season) => (
                  <SelectItem
                    key={season}
                    value={season.toString()}
                    className="text-white hover:bg-gray-700"
                  >
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="championship" className="text-white/80">
              Compétition
            </Label>
            <Select
              value={selectedChampionshipId.toString()}
              onValueChange={handleChampionshipChange}
              disabled={loading || championships.length === 0}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <SelectValue
                  placeholder={
                    loading ? "Chargement..." : "Sélectionner une compétition"
                  }
                  className="truncate"
                />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {championships.map((championship) => (
                  <SelectItem
                    key={championship.id}
                    value={championship.id.toString()}
                    className="text-white hover:bg-gray-700 truncate"
                  >
                    {championship.label.length > 30
                      ? `${championship.label.substring(0, 30)}...`
                      : championship.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Affichage des poules */}
      {(initialLoading || days.length === 0) && <SkeletonLoader />}

      {!initialLoading && pools.length > 0 && (
        <div>
          {/* Navigation par semaines */}
          {days.length > 0 && (
            <div className="mb-4">
              <div className="overflow-x-auto">
                <div className="flex gap-2">
                  {days.map((day, index) => (
                    <button
                      key={day.id}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                        index === 0 ? "shadow-sm" : ""
                      }`}
                      onClick={() => console.log("Semaine sélectionnée:", day)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sélecteur de Pool */}
          {pools.length > 0 && (
            <div className="mb-6 w-full sm:w-64">
              <Label htmlFor="pool" className="text-white/80 mb-2 block">
                Poule
              </Label>
              <Select
                onValueChange={(value) => setSelectedPoolId(Number(value))}
                value={selectedPoolId.toString()}
                disabled={loading}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <SelectValue placeholder="Sélectionner une pool" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {pools.map((pool) => (
                    <SelectItem
                      key={pool.id}
                      value={pool.id.toString()}
                      className="text-white hover:bg-gray-700 truncate"
                    >
                      {pool.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Affichage des matchs */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded p-3 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-2">
              {matches.map((match, index) => (
                <div key={`match-${index}`} className="bg-white/10 rounded p-3">
                  <div className="text-white text-center">
                    <div className="font-medium">
                      {match.team_a.name} {match.team_a.score} -{" "}
                      {match.team_b.score} {match.team_b.name}
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {new Date(match.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {!initialLoading &&
        !loading &&
        selectedChampionshipId > 0 &&
        pools.length === 0 && (
          <div className="text-center py-8">
            <div className="text-white/60">
              Aucune poule trouvée pour cette compétition
            </div>
          </div>
        )}
    </div>
  );
}
