"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";

import { useAppDataSupabase } from "../hooks/useAppDataSupabase";

import { ChampionshipSelector } from "./ChampionshipSelector";
import { DaysNavigation } from "./organisms/DaysNavigation";
import { OptimizedMatchesList } from "./organisms/OptimizedMatchesList";
import { RankingTable } from "./organisms/RankingTable";
import { PoolSelector } from "./PoolSelector";
import { SeasonSelector } from "./SeasonSelector";

const formatDay = (date: string) =>
  new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

function StatusMessage({ title, text }: { title: string; text?: string }) {
  return (
    <div className="border-y border-line py-10">
      <p className="font-score text-2xl font-bold text-chalk">{title}</p>
      {text && <p className="mt-1 text-sm text-stone">{text}</p>}
    </div>
  );
}

export function PoolsSelector() {
  const seasons = [2026]; // Saisons disponibles

  const {
    currentSeason,
    selectedChampionshipId,
    selectedPoolId,
    selectedDayId,
    championships,
    pools,
    days,
    matches,
    rankings,
    loading,
    initialLoading,
    poolChangeLoading,
    errors,
    handleSeasonChange,
    handleChampionshipChange,
    handlePoolChange,
    handleDayChange,
  } = useAppDataSupabase();

  // Erreurs de compétitions et de poules : notification, car elles bloquent
  // toute la page. Les erreurs de matchs s'affichent à leur place.
  useEffect(() => {
    if (errors.championships && !initialLoading) {
      const rateLimited =
        errors.championships.includes("too many requests") ||
        errors.championships.includes("rate limit");
      toast.error(
        rateLimited
          ? "Trop de requêtes, réessayez dans quelques minutes"
          : "Les compétitions n'ont pas pu être chargées",
        { duration: rateLimited ? 10000 : undefined }
      );
    }
  }, [errors.championships, initialLoading]);

  useEffect(() => {
    if (errors.pools && !initialLoading) {
      toast.error("Les poules n'ont pas pu être chargées");
    }
  }, [errors.pools, initialLoading]);

  const selectedDay = days.find(day => day.id === selectedDayId);
  const selectedPool = pools.find(pool => pool.id === selectedPoolId);
  const today = new Date().toISOString().slice(0, 10);
  const dayIsUpcoming =
    !!selectedDay?.date && selectedDay.date.slice(0, 10) > today;
  const showResults = selectedPoolId > 0 && days.length > 0;

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_8.75rem] gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_9rem]">
        <div className="col-span-2 sm:col-span-1">
          <ChampionshipSelector
            championships={championships}
            selectedChampionshipId={selectedChampionshipId}
            onChampionshipChange={handleChampionshipChange}
            loading={loading.championships}
          />
        </div>
        <PoolSelector
          pools={pools}
          selectedPoolId={selectedPoolId}
          onPoolChange={handlePoolChange}
          loading={loading.pools || poolChangeLoading}
        />
        <SeasonSelector
          seasons={seasons}
          currentSeason={currentSeason}
          onSeasonChange={handleSeasonChange}
        />
      </div>

      {showResults ? (
        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14">
          <section aria-labelledby="scores-title">
            <DaysNavigation
              days={days}
              selectedDayId={selectedDayId}
              onDaySelect={day => handleDayChange(day.id.toString())}
              data-testid="days-navigation"
            />

            {selectedDayId > 0 && (
              <>
                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-[4px] bg-flag px-4 py-2.5 text-ink">
                  <h2
                    id="scores-title"
                    className="font-score text-[1.75rem] leading-none font-black"
                  >
                    {dayIsUpcoming ? "À venir" : "Score final"}
                  </h2>
                  <p className="text-sm font-semibold first-letter:uppercase">
                    {[
                      selectedPool?.label,
                      selectedDay?.date && formatDay(selectedDay.date),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <OptimizedMatchesList
                  key={selectedDayId}
                  matches={matches}
                  loading={loading.matches}
                  error={errors.matches ? String(errors.matches) : null}
                  onRetry={() => window.location.reload()}
                  data-testid="matches-list"
                />
              </>
            )}
          </section>

          <aside
            aria-labelledby="ranking-title"
            className="mt-12 self-start lg:sticky lg:top-24 lg:mt-0"
          >
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <h2
                id="ranking-title"
                className="font-score text-[1.75rem] leading-none font-black"
              >
                Classement
              </h2>
              <Link
                href="/classements"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-stone transition-colors hover:text-flag"
              >
                Toutes les poules
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <RankingTable
              rankings={rankings}
              caption={`Classement ${selectedPool?.label ?? "de la poule"}`}
              loading={loading.rankings}
              compact
            />
          </aside>
        </div>
      ) : (
        <div className="mt-8">
          {initialLoading ? (
            <StatusMessage title="Chargement…" />
          ) : championships.length === 0 ? (
            <StatusMessage
              title="Aucune compétition"
              text="Les compétitions de la saison n'ont pas encore été publiées."
            />
          ) : selectedPoolId === 0 ? (
            <StatusMessage
              title="Choisissez une poule"
              text="Les journées et les scores s'affichent ici."
            />
          ) : loading.days ? (
            <StatusMessage title="Chargement des journées…" />
          ) : (
            <StatusMessage
              title="Pas encore de journée"
              text="Le calendrier de cette poule n'a pas encore été publié."
            />
          )}
        </div>
      )}
    </div>
  );
}
