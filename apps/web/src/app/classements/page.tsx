"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Ranking } from "../../app/types";
import { ChampionshipSelector } from "../../components/ChampionshipSelector";
import { RankingTable } from "../../components/organisms/RankingTable";
import { PoolSelector } from "../../components/PoolSelector";
import { SeasonSelector } from "../../components/SeasonSelector";
import { useSocialResults } from "../../hooks/useSocialResults";
import {
  useChampionshipsOptimized,
  usePoolsOptimized,
  useRankingsOptimized,
} from "../../hooks/useSupabaseOptimized";

import { FAKE_DATA } from "@/lib/fake-data";

interface RankingRow {
  id: string;
  position: number;
  team_name: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
}

// [abréviation, signification, visible seulement à partir de sm]
const LEGEND: Array<[string, string, boolean]> = [
  ["J", "matchs joués", false],
  ["G", "gagnés", true],
  ["N", "nuls", true],
  ["P", "perdus", true],
  ["Diff", "points marqués moins points encaissés", false],
  ["Pts", "points au classement", false],
];

/** Ancienne source (données FFFA en base), gardée pour le mode démo. */
function useLegacyRankings() {
  const [selectedChampionshipId, setSelectedChampionshipId] = useState(0);
  const [selectedPoolId, setSelectedPoolId] = useState(0);

  const {
    data: championshipsData,
    isLoading: championshipsLoading,
    error: championshipsError,
  } = useChampionshipsOptimized();

  const championships = useMemo(
    () =>
      championshipsData?.data?.map(c => ({
        id: c.id,
        label: c.name,
        male: true,
        season: parseInt(c.season),
      })) ?? [],
    [championshipsData]
  );

  const effectiveChampionshipId =
    selectedChampionshipId > 0
      ? selectedChampionshipId
      : (championships[0]?.id ?? 0);

  const {
    data: poolsData,
    isLoading: poolsLoading,
    error: poolsError,
  } = usePoolsOptimized(effectiveChampionshipId);

  const pools = useMemo(
    () =>
      poolsData?.data?.map(p => ({
        id: p.id,
        label: p.name,
        championship_id: p.championship_id,
        phase_id: p.id,
      })) ?? [],
    [poolsData]
  );

  const effectivePoolId =
    selectedPoolId > 0 ? selectedPoolId : (pools[0]?.id ?? 0);

  const {
    data: rankingsData,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useRankingsOptimized(effectivePoolId);

  const rankings: Ranking[] = useMemo(
    () =>
      ((rankingsData?.data ?? []) as RankingRow[]).map(r => ({
        position: r.position,
        club: {
          id: parseInt(r.id) || 0,
          label: r.team_name,
          general_forfeit: false,
        },
        points: r.points,
        j: r.played,
        g: r.won,
        n: r.drawn,
        p: r.lost,
        points_won: r.goals_for,
        points_loss: r.goals_against,
        points_diff: r.goal_difference,
      })),
    [rankingsData]
  );

  useEffect(() => {
    if (championshipsError) {
      toast.error("Les compétitions n'ont pas pu être chargées");
    }
  }, [championshipsError]);

  useEffect(() => {
    if (poolsError) toast.error("Les poules n'ont pas pu être chargées");
  }, [poolsError]);

  useEffect(() => {
    if (rankingsError) toast.error("Le classement n'a pas pu être chargé");
  }, [rankingsError]);

  const handleChampionshipChange = useCallback((id: string) => {
    setSelectedChampionshipId(parseInt(id));
    setSelectedPoolId(0);
  }, []);

  return {
    championships,
    selectedChampionshipId: effectiveChampionshipId,
    pools,
    selectedPoolId: effectivePoolId,
    rankings,
    loading: {
      championships: championshipsLoading,
      pools: poolsLoading,
      rankings: rankingsLoading,
    },
    handleChampionshipChange,
    handlePoolChange: (id: string) => setSelectedPoolId(parseInt(id)),
  };
}

/** Classements calculés à partir des scores relevés sur Instagram. */
function useSocialRankings() {
  const data = useSocialResults();
  useEffect(() => {
    if (data.errors.rankings) {
      toast.error("Le classement n'a pas pu être chargé");
    }
  }, [data.errors.rankings]);
  return {
    championships: data.championships,
    selectedChampionshipId: data.selectedChampionshipId,
    pools: data.pools,
    selectedPoolId: data.selectedPoolId,
    rankings: data.rankings,
    loading: {
      championships: false,
      pools: false,
      rankings: data.loading.rankings,
    },
    handleChampionshipChange: data.handleChampionshipChange,
    handlePoolChange: data.handlePoolChange,
  };
}

const useRankingsData = FAKE_DATA ? useLegacyRankings : useSocialRankings;

const Rankings = () => {
  const [seasons] = useState<number[]>([2026]);
  const [currentSeason, setCurrentSeason] = useState<number>(2026);
  const {
    championships,
    selectedChampionshipId: effectiveChampionshipId,
    pools,
    selectedPoolId: effectivePoolId,
    rankings,
    loading: {
      championships: championshipsLoading,
      pools: poolsLoading,
      rankings: rankingsLoading,
    },
    handleChampionshipChange,
    handlePoolChange,
  } = useRankingsData();
  const selectedPool = pools.find(p => p.id === effectivePoolId);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-10">
      <h1 className="font-score mb-4 text-[2rem] leading-none font-black text-chalk sm:mb-6 sm:text-5xl">
        Classements
      </h1>

      <div className="grid grid-cols-[minmax(0,1fr)_8.75rem] gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_9rem]">
        <div className="col-span-2 sm:col-span-1">
          <ChampionshipSelector
            championships={championships}
            selectedChampionshipId={effectiveChampionshipId}
            onChampionshipChange={handleChampionshipChange}
            loading={championshipsLoading}
          />
        </div>
        <PoolSelector
          pools={pools}
          selectedPoolId={effectivePoolId}
          onPoolChange={handlePoolChange}
          loading={poolsLoading}
        />
        <SeasonSelector
          seasons={seasons}
          currentSeason={currentSeason}
          onSeasonChange={s => setCurrentSeason(parseInt(s))}
        />
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14">
        <section aria-labelledby="pool-title">
          <div className="mb-2 rounded-[4px] bg-flag px-4 py-2.5 text-ink">
            <h2
              id="pool-title"
              className="font-score text-[1.75rem] leading-none font-black"
            >
              {selectedPool?.label ?? "Classement"}
            </h2>
          </div>

          {effectivePoolId > 0 ? (
            <RankingTable
              rankings={rankings}
              caption={`Classement ${selectedPool?.label ?? ""}`}
              loading={rankingsLoading}
            />
          ) : (
            <p className="border-y border-line py-10 text-sm text-stone">
              {championshipsLoading || poolsLoading
                ? "Chargement…"
                : "Choisissez une compétition et une poule pour voir le classement."}
            </p>
          )}
        </section>

        <aside
          aria-labelledby="legend-title"
          className="mt-6 self-start lg:sticky lg:top-24 lg:mt-0 lg:border-t lg:border-line lg:pt-4"
        >
          <h2
            id="legend-title"
            className="font-score sr-only text-2xl font-black lg:not-sr-only lg:mb-3 lg:block"
          >
            Lire le classement
          </h2>
          <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone lg:flex-col lg:gap-y-2 lg:text-sm">
            {LEGEND.map(([abbr, text, smOnly]) => (
              <div
                key={abbr}
                className={smOnly ? "hidden gap-1.5 sm:flex" : "flex gap-1.5"}
              >
                <dt className="font-semibold text-chalk">{abbr}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 hidden max-w-sm text-sm leading-relaxed text-stone lg:block">
            Le classement de la poule est mis à jour après chaque journée, à
            partir des scores publiés par les clubs sur Instagram. Victoire 3
            points, nul 1, défaite 0.
          </p>
          {!FAKE_DATA && (
            <p className="mt-3 hidden max-w-sm text-sm leading-relaxed text-stone lg:block">
              En championnat, le 1er de la poule se qualifie pour la D1 et le 2e
              pour la D2.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
};

export const dynamic = "force-dynamic";

export default Rankings;
