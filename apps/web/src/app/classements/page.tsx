"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Ranking } from "../../app/types";
import { ChampionshipSelector } from "../../components/ChampionshipSelector";
import { RankingTable } from "../../components/organisms/RankingTable";
import { PoolSelector } from "../../components/PoolSelector";
import { SeasonSelector } from "../../components/SeasonSelector";
import {
  useChampionshipsOptimized,
  usePoolsOptimized,
  useRankingsOptimized,
} from "../../hooks/useSupabaseOptimized";

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

const LEGEND: Array<[string, string]> = [
  ["J", "matchs joués"],
  ["G", "gagnés"],
  ["N", "nuls"],
  ["P", "perdus"],
  ["Diff", "points marqués moins points encaissés"],
  ["Pts", "points au classement"],
];

const Rankings = () => {
  const [seasons] = useState<number[]>([2026]);
  const [currentSeason, setCurrentSeason] = useState<number>(2026);
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
  const selectedPool = pools.find(p => p.id === effectivePoolId);

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

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="font-score text-[clamp(2.5rem,11.5vw,3.75rem)] leading-none font-black text-chalk">
          Classements
        </h1>
        <p className="mt-2 max-w-xl text-sm text-stone sm:text-base">
          Le classement de chaque poule, mis à jour après chaque journée.
        </p>
      </header>

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
          onPoolChange={id => setSelectedPoolId(parseInt(id))}
          loading={poolsLoading}
        />
        <SeasonSelector
          seasons={seasons}
          currentSeason={currentSeason}
          onSeasonChange={s => setCurrentSeason(parseInt(s))}
        />
      </div>

      <section aria-labelledby="pool-title" className="mt-8 max-w-3xl">
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

        <dl className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone">
          {LEGEND.map(([abbr, text]) => (
            <div key={abbr} className="flex gap-1.5">
              <dt className="font-semibold text-chalk">{abbr}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};

export const dynamic = "force-dynamic";

export default Rankings;
