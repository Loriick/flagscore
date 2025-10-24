"use client";

import { useState, useEffect } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Championship, Pool } from "../app/types";
import {
  getSeasons,
  getChampionships,
  getPhases,
  getPools,
} from "../lib/fffa-api";

export function PoolsList() {
  const [seasons, setSeasons] = useState<number[]>([]);
  const [currentSeason, setCurrentSeason] = useState<number>(0);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [poolsByChampionship, setPoolsByChampionship] = useState<
    Record<number, Pool[]>
  >({});
  const [loading, setLoading] = useState(false);

  // Charger les saisons et définir la saison courante
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const seasonsData = await getSeasons();
        setSeasons(seasonsData);

        // Utiliser la première saison (la plus récente) par défaut
        if (seasonsData.length > 0) {
          setCurrentSeason(seasonsData[0]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des saisons:", error);
      }
    };

    fetchSeasons();
  }, []);

  // Charger les compétitions et pools quand la saison change
  useEffect(() => {
    const fetchData = async () => {
      if (!currentSeason) return;

      setLoading(true);
      try {
        // Charger les compétitions avec la saison courante
        const championshipsData = await getChampionships(currentSeason);
        setChampionships(championshipsData);

        // Charger les phases et pools pour chaque compétition
        const poolsData: Record<number, Pool[]> = {};
        for (const championship of championshipsData) {
          try {
            // 1. Récupérer les phases de la compétition
            const phases = await getPhases(championship.id);
            console.log(
              `Phases pour ${championship.label} (ID: ${championship.id}):`,
              phases
            );

            // 2. Pour chaque phase, récupérer les pools
            const allPools: Pool[] = [];
            for (const phase of phases) {
              try {
                const pools = await getPools(phase.id);
                allPools.push(...pools);
                console.log(
                  `Pools pour phase ${phase.label} (Phase ID: ${phase.id}):`,
                  pools
                );
              } catch (error) {
                console.error(`Erreur pools pour phase ${phase.label}:`, error);
              }
            }

            poolsData[championship.id] = allPools;
          } catch (error) {
            console.error(
              `Erreur lors du chargement des phases pour ${championship.label}:`,
              error
            );
            poolsData[championship.id] = [];
          }
        }
        setPoolsByChampionship(poolsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentSeason]);

  const handleSeasonChange = (season: string) => {
    setCurrentSeason(Number(season));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-white/60">Chargement des poules...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Poules par Compétition
        </h2>

        {/* Sélecteur de saison */}
        <div className="flex items-center gap-4">
          <Label htmlFor="season" className="text-white/80">
            Saison:
          </Label>
          <Select
            value={currentSeason.toString()}
            onValueChange={handleSeasonChange}
          >
            <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <SelectValue placeholder="Sélectionner une saison" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {seasons.map((season) => (
                <SelectItem
                  key={`poolslist-season-${season}`}
                  value={season.toString()}
                  className="text-white hover:bg-gray-700"
                >
                  {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {championships.map((championship) => (
          <AccordionItem
            key={`poolslist-championship-${championship.id}`}
            value={`championship-${championship.id}`}
            className="bg-gray-800 border border-gray-600 rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 text-white hover:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold">{championship.label}</span>
                <span className="text-sm text-white/60">
                  {poolsByChampionship[championship.id]?.length || 0} poule(s)
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {poolsByChampionship[championship.id]?.length > 0 ? (
                  poolsByChampionship[championship.id].map((pool) => (
                    <div
                      key={`poolslist-pool-${pool.id}`}
                      className="bg-gray-700 p-3 rounded-md hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => console.log("Pool sélectionné:", pool)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {pool.label}
                        </span>
                        <span className="text-xs text-white/60">
                          ID: {pool.id}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white/60 text-sm py-2">
                    Aucune poule disponible pour cette compétition
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
