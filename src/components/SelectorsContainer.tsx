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

import { Championship, Pool } from "../app/types";
import { getChampionships, getPools } from "../lib/fffa-api";

interface SeasonSelectorProps {
  seasons: number[];
  onSeasonChange: (season: number) => void;
}

interface ChampionshipSelectorProps {
  season: number;
  onChampionshipChange: (championshipId: number) => void;
}

interface PoolSelectorProps {
  championshipId: number;
  onPoolChange: (poolId: number) => void;
}

function SeasonSelector({ seasons, onSeasonChange }: SeasonSelectorProps) {
  return (
    <div className="flex-1 space-y-2">
      <Label htmlFor="season" className="text-white/80">
        Saison
      </Label>
      <Select onValueChange={(value) => onSeasonChange(Number(value))}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer">
          <SelectValue placeholder="saison" />
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
  );
}

function ChampionshipSelector({
  season,
  onChampionshipChange,
}: ChampionshipSelectorProps) {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChampionships = async () => {
      setLoading(true);
      try {
        // Utiliser la saison sélectionnée ou 0 par défaut
        const seasonToUse = season || 0;
        const data = await getChampionships(seasonToUse);
        setChampionships(data);
      } catch (error) {
        console.error("Erreur lors du chargement des compétitions:", error);
        setChampionships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChampionships();
  }, [season]);

  return (
    <div className="flex-1 space-y-2">
      <Label htmlFor="championship" className="text-white/80">
        Compétition
      </Label>
      <Select
        onValueChange={(value) => onChampionshipChange(Number(value))}
        disabled={loading}
      >
        <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer">
          <SelectValue
            placeholder={
              loading ? "Chargement..." : "Sélectionner une compétition"
            }
          />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {championships.map((championship) => (
            <SelectItem
              key={championship.id}
              value={championship.id.toString()}
              className="text-white hover:bg-gray-700"
            >
              {championship.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PoolSelector({ championshipId, onPoolChange }: PoolSelectorProps) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPools = async () => {
      if (!championshipId) {
        setPools([]);
        return;
      }

      setLoading(true);
      try {
        // Pour récupérer les pools, on a besoin du phase_id
        // On va utiliser le championshipId comme phase_id pour l'instant
        const data = await getPools(championshipId);
        setPools(data);
      } catch (error) {
        console.error("Erreur lors du chargement des pools:", error);
        setPools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [championshipId]);

  return (
    <div className="flex-1 space-y-2">
      <Label htmlFor="pool" className="text-white/80">
        Pôle
      </Label>
      <Select
        onValueChange={(value) => onPoolChange(Number(value))}
        disabled={loading || !championshipId}
      >
        <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer">
          <SelectValue
            placeholder={loading ? "Chargement..." : "Sélectionner un pôle"}
          />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {pools.map((pool) => (
            <SelectItem
              key={pool.id}
              value={pool.id.toString()}
              className="text-white hover:bg-gray-700"
            >
              {pool.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SelectorsContainer({ seasons }: { seasons: number[] }) {
  const [selectedSeason, setSelectedSeason] = useState<number>(0);
  const [selectedChampionshipId, setSelectedChampionshipId] =
    useState<number>(0);
  const [selectedPoolId, setSelectedPoolId] = useState<number>(0);

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season);
    setSelectedChampionshipId(0); // Reset championship when season changes
    setSelectedPoolId(0); // Reset pool when season changes
  };

  const handleChampionshipChange = (championshipId: number) => {
    setSelectedChampionshipId(championshipId);
    setSelectedPoolId(0); // Reset pool when championship changes
    console.log("Championship ID sélectionné:", championshipId);
  };

  const handlePoolChange = (poolId: number) => {
    setSelectedPoolId(poolId);
    console.log("Pool ID sélectionné:", poolId);
  };

  return (
    <div className="flex flex-row items-end gap-4">
      <SeasonSelector seasons={seasons} onSeasonChange={handleSeasonChange} />
      <ChampionshipSelector
        season={selectedSeason}
        onChampionshipChange={handleChampionshipChange}
      />
      <PoolSelector
        championshipId={selectedChampionshipId}
        onPoolChange={handlePoolChange}
      />
    </div>
  );
}
