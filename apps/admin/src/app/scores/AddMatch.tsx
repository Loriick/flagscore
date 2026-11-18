"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  type SocialMatchRow,
  SOCIAL_CHAMPIONSHIPS,
  socialDays,
  socialMatches,
  socialPools,
  socialPoolTeams,
} from "@flagscore/core/social/results";

const fieldClass =
  "h-11 w-full rounded-[4px] border border-line bg-ink-raised px-3 text-chalk focus:border-flag focus:outline-none";
const labelClass = "mb-1 block text-sm font-semibold text-stone";

const pairKey = (a: string, b: string) => [a, b].sort().join("|");

/**
 * Saisie d'un match dont le score est connu par un autre moyen qu'Instagram
 * (feuille de match, message d'un club…).
 */
export function AddMatch({
  submit,
  loadPublished,
}: {
  submit: (body: Record<string, unknown>) => Promise<{ updated?: boolean }>;
  loadPublished: () => Promise<SocialMatchRow[]>;
}) {
  const [championshipId, setChampionshipId] = useState(1);
  const pools = useMemo(() => socialPools(championshipId), [championshipId]);
  const [poolId, setPoolId] = useState(pools[0]?.id ?? 0);
  const days = useMemo(() => socialDays(poolId), [poolId]);
  const today = new Date().toISOString().slice(0, 10);
  const [dayId, setDayId] = useState(0);
  const selectedDay =
    days.find(d => d.id === dayId) ??
    [...days].reverse().find(d => d.date <= today) ??
    days[0];
  const teams = useMemo(() => socialPoolTeams(poolId), [poolId]);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [busy, setBusy] = useState(false);

  const [rows, setRows] = useState<SocialMatchRow[]>([]);
  const refetch = useCallback(
    () =>
      loadPublished()
        .then(setRows)
        .catch((e: Error) => toast.error(e.message)),
    [loadPublished]
  );
  useEffect(() => {
    void refetch();
  }, [refetch]);

  const known = selectedDay ? socialMatches(rows, poolId, selectedDay.id) : [];
  const knownPairs = new Set(
    known.map(m => pairKey(m.team_a.name, m.team_b.name))
  );
  const missing = teams.flatMap((a, i) =>
    teams
      .slice(i + 1)
      .filter(b => !knownPairs.has(pairKey(a.label, b.label)))
      .map(b => [a, b] as const)
  );

  const changeChampionship = (id: number) => {
    setChampionshipId(id);
    setPoolId(socialPools(id)[0]?.id ?? 0);
    setDayId(0);
    setTeamA("");
    setTeamB("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(scoreA);
    const b = Number(scoreB);
    if (!teamA || !teamB || teamA === teamB) {
      toast.error("Choisissez deux équipes différentes");
      return;
    }
    if (
      scoreA === "" ||
      scoreB === "" ||
      !Number.isInteger(a) ||
      !Number.isInteger(b)
    ) {
      toast.error("Indiquez les deux scores");
      return;
    }
    setBusy(true);
    try {
      const res = await submit({
        action: "create",
        pool_id: poolId,
        day_id: selectedDay?.id,
        team_a: teamA,
        team_b: teamB,
        score_a: a,
        score_b: b,
      });
      toast.success(
        res.updated
          ? "Score enregistré (le match était déjà connu)"
          : "Match ajouté"
      );
      setTeamA("");
      setTeamB("");
      setScoreA("");
      setScoreB("");
      void refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="add-competition" className={labelClass}>
              Compétition
            </label>
            <select
              id="add-competition"
              value={championshipId}
              onChange={e => changeChampionship(Number(e.target.value))}
              className={fieldClass}
            >
              {SOCIAL_CHAMPIONSHIPS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="add-pool" className={labelClass}>
              Poule
            </label>
            <select
              id="add-pool"
              value={poolId}
              onChange={e => {
                setPoolId(Number(e.target.value));
                setTeamA("");
                setTeamB("");
              }}
              className={fieldClass}
            >
              {pools.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="add-day" className={labelClass}>
              Journée
            </label>
            <select
              id="add-day"
              value={selectedDay?.id ?? 0}
              onChange={e => setDayId(Number(e.target.value))}
              className={fieldClass}
            >
              {days.map(d => (
                <option key={d.id} value={d.id}>
                  {d.label} ·{" "}
                  {new Date(d.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(
          [
            ["a", teamA, setTeamA, scoreA, setScoreA],
            ["b", teamB, setTeamB, scoreB, setScoreB],
          ] as const
        ).map(([side, team, setTeam, score, setScore]) => (
          <div
            key={side}
            className="grid grid-cols-[minmax(0,1fr)_5rem] items-end gap-3"
          >
            <div>
              <label htmlFor={`add-team-${side}`} className={labelClass}>
                Équipe {side === "a" ? 1 : 2}
              </label>
              <select
                id={`add-team-${side}`}
                value={team}
                onChange={e => setTeam(e.target.value)}
                className={fieldClass}
              >
                <option value="">Choisir…</option>
                {teams.map(t => (
                  <option key={t.ref} value={t.ref}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`add-score-${side}`} className={labelClass}>
                Score
              </label>
              <input
                id={`add-score-${side}`}
                type="number"
                inputMode="numeric"
                min={0}
                max={300}
                value={score}
                onChange={e => setScore(e.target.value)}
                className={`${fieldClass} font-score text-center text-2xl font-black`}
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 items-center rounded-[4px] bg-flag px-4 text-sm font-bold text-ink transition-colors hover:bg-flag-deep disabled:opacity-50"
        >
          Ajouter ce match
        </button>
      </form>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-score mb-2 text-xl font-black text-chalk">
            Manquants ({missing.length})
          </h2>
          {missing.length === 0 ? (
            <p className="text-sm text-stone">Tous les matchs sont connus.</p>
          ) : (
            <ul className="space-y-1">
              {missing.map(([a, b]) => (
                <li key={`${a.ref}|${b.ref}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setTeamA(a.ref);
                      setTeamB(b.ref);
                    }}
                    className="min-h-9 text-left text-sm text-chalk underline decoration-line underline-offset-2 hover:text-flag"
                  >
                    {a.label} – {b.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-score mb-2 text-xl font-black text-chalk">
            Déjà connus ({known.length})
          </h2>
          <ul className="space-y-1 text-sm text-stone">
            {known.map(m => (
              <li key={`${m.team_a.name}|${m.team_b.name}`}>
                {m.team_a.name} {m.team_a.score} – {m.team_b.score}{" "}
                {m.team_b.name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
