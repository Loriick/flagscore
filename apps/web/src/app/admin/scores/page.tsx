"use client";

import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

/** Mot de passe gardé le temps de l'onglet. */
const STORAGE_KEY = "flagscore-admin-secret";

type View = "pending" | "published" | "reviewed";

const VIEWS: Array<[View, string]> = [
  ["pending", "À vérifier"],
  ["published", "Publiés"],
  ["reviewed", "Décidés"],
];

interface Evidence {
  id: string;
  account: string;
  team_raw: string;
  opponent_raw: string;
  team_score: number;
  opponent_score: number;
  confidence: number;
  permalink: string | null;
  /** Score remis dans l'ordre domicile / extérieur, si on sait qui a publié. */
  oriented: { home_score: number; away_score: number } | null;
}

interface AdminMatch {
  match_key: string;
  competition: string;
  stage: string;
  event_start: string;
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  status: "confirmed" | "single_source" | "conflict";
  review: "approved" | "rejected" | null;
  review_score_home: number | null;
  review_score_away: number | null;
  reason: string | null;
  evidence: Evidence[];
}

const STATUS_LABEL: Record<AdminMatch["status"], string> = {
  confirmed: "Confirmé par les 2 clubs",
  single_source: "Une seule source",
  conflict: "Conflit entre les sources",
};

const COMPETITION_LABEL: Record<string, string> = {
  CM: "Championnat mixte",
  CDF: "Coupe de France",
};

const readSecret = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

const saveSecret = (value: string) => {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, value);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Stockage indisponible (navigation privée) : il faudra se reconnecter.
  }
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={300}
      aria-label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="font-score h-12 w-16 rounded-[4px] border border-line bg-ink-raised text-center text-2xl font-black text-chalk focus:border-flag focus:outline-none"
    />
  );
}

function MatchReview({
  match,
  view,
  onDecide,
}: {
  match: AdminMatch;
  view: View;
  onDecide: (
    match: AdminMatch,
    action: "approve" | "reject" | "reset",
    scores?: [number, number]
  ) => Promise<void>;
}) {
  // Pré-rempli avec la décision, le score retenu, sinon le premier post.
  const firstPost = match.evidence.find(e => e.oriented)?.oriented;
  const [home, setHome] = useState(
    String(
      match.review_score_home ?? match.score_home ?? firstPost?.home_score ?? ""
    )
  );
  const [away, setAway] = useState(
    String(
      match.review_score_away ?? match.score_away ?? firstPost?.away_score ?? ""
    )
  );
  const [busy, setBusy] = useState(false);

  const run = async (
    action: "approve" | "reject" | "reset",
    scores?: [number, number]
  ) => {
    setBusy(true);
    try {
      await onDecide(match, action, scores);
    } finally {
      setBusy(false);
    }
  };

  const approve = () => {
    const h = Number(home);
    const a = Number(away);
    if (
      home === "" ||
      away === "" ||
      !Number.isInteger(h) ||
      !Number.isInteger(a)
    ) {
      toast.error("Indiquez les deux scores");
      return;
    }
    void run("approve", [h, a]);
  };

  return (
    <li className="border-b border-line py-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span
          className={cn(
            "rounded-[3px] px-1.5 py-0.5",
            match.status === "conflict"
              ? "bg-red-500/20 text-red-300"
              : "bg-ink-raised text-stone"
          )}
        >
          {STATUS_LABEL[match.status]}
        </span>
        {match.review && (
          <span
            className={cn(
              "rounded-[3px] px-1.5 py-0.5",
              match.review === "approved"
                ? "bg-flag text-ink"
                : "border border-line text-stone"
            )}
          >
            {match.review === "approved" ? "Validé" : "Rejeté"}
          </span>
        )}
        {match.reason && <span className="text-stone">{match.reason}</span>}
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2">
        <span className="font-score text-xl leading-tight font-bold text-chalk">
          {match.team_home}
        </span>
        <ScoreInput
          label={`Score de ${match.team_home}`}
          value={home}
          onChange={setHome}
        />
        <span className="font-score text-xl leading-tight font-bold text-chalk">
          {match.team_away}
        </span>
        <ScoreInput
          label={`Score de ${match.team_away}`}
          value={away}
          onChange={setAway}
        />
      </div>

      {match.evidence.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-stone">
          {match.evidence.map(e => (
            <li key={e.id} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold text-chalk">@{e.account}</span>
              <span>
                « {e.team_raw} {e.team_score} – {e.opponent_score}{" "}
                {e.opponent_raw} »
              </span>
              <span className="text-xs">
                lecture sûre à {Math.round(e.confidence * 100)} %
              </span>
              {e.oriented && (
                <button
                  type="button"
                  onClick={() => {
                    setHome(String(e.oriented!.home_score));
                    setAway(String(e.oriented!.away_score));
                  }}
                  className="text-xs font-semibold text-chalk underline underline-offset-2 hover:text-flag"
                >
                  Reprendre {e.oriented.home_score} – {e.oriented.away_score}
                </button>
              )}
              {e.permalink && (
                <a
                  href={e.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs underline underline-offset-2 hover:text-flag"
                >
                  Voir le post
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={approve}
          className="inline-flex min-h-11 items-center rounded-[4px] bg-flag px-4 text-sm font-bold text-ink transition-colors hover:bg-flag-deep disabled:opacity-50"
        >
          {view === "pending" ? "Valider ce score" : "Enregistrer ce score"}
        </button>
        {match.review !== "rejected" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("reject")}
            className="inline-flex min-h-11 items-center rounded-[4px] border border-line px-4 text-sm font-semibold text-chalk transition-colors hover:border-chalk disabled:opacity-50"
          >
            {view === "published" ? "Retirer du site" : "Rejeter"}
          </button>
        )}
        {match.review && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("reset")}
            className="inline-flex min-h-11 items-center rounded-[4px] px-4 text-sm font-semibold text-stone transition-colors hover:text-chalk disabled:opacity-50"
          >
            Annuler la décision
          </button>
        )}
      </div>
    </li>
  );
}

export default function AdminScoresPage() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>("pending");
  const [matches, setMatches] = useState<AdminMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setSecret(readSecret()), []);

  const api = useCallback(
    async (init?: RequestInit, query = "") => {
      const res = await fetch(`/api/admin/social-matches${query}`, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) {
        saveSecret("");
        setSecret("");
        throw new Error("Mot de passe incorrect");
      }
      if (!res.ok || !body.ok) {
        throw new Error(body.message ?? `Erreur ${res.status}`);
      }
      return body;
    },
    [secret]
  );

  useEffect(() => {
    if (!secret) return;
    setLoading(true);
    setError(null);
    api(undefined, `?view=${view}`)
      .then(body => setMatches(body.matches))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [api, secret, view]);

  const decide = useCallback(
    async (
      match: AdminMatch,
      action: "approve" | "reject" | "reset",
      scores?: [number, number]
    ) => {
      try {
        await api({
          method: "POST",
          body: JSON.stringify({
            match_key: match.match_key,
            action,
            score_home: scores?.[0],
            score_away: scores?.[1],
          }),
        });
        setMatches(list =>
          (list ?? []).filter(m => m.match_key !== match.match_key)
        );
        toast.success(
          action === "approve"
            ? "Score validé"
            : action === "reject"
              ? "Score rejeté"
              : "Décision annulée"
        );
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [api]
  );

  if (!secret) {
    return (
      <div className="mx-auto max-w-md px-4 pt-10 sm:px-6">
        <h1 className="font-score mb-6 text-4xl leading-none font-black text-chalk">
          Validation des scores
        </h1>
        <form
          onSubmit={e => {
            e.preventDefault();
            saveSecret(input);
            setSecret(input);
          }}
          className="space-y-3"
        >
          <label
            htmlFor="admin-secret"
            className="block text-sm font-semibold text-stone"
          >
            Mot de passe
          </label>
          <input
            id="admin-secret"
            type="password"
            autoComplete="current-password"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="h-11 w-full rounded-[4px] border border-line bg-ink-raised px-3 text-chalk focus:border-flag focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input}
            className="inline-flex min-h-11 items-center rounded-[4px] bg-flag px-4 text-sm font-bold text-ink transition-colors hover:bg-flag-deep disabled:opacity-50"
          >
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  // Regroupement par journée.
  const groups = new Map<string, AdminMatch[]>();
  for (const m of matches ?? []) {
    const key = `${COMPETITION_LABEL[m.competition] ?? m.competition} · ${m.stage} · ${formatDate(m.event_start)}`;
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-5 sm:px-6 sm:pt-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-score text-4xl leading-none font-black text-chalk sm:text-5xl">
          Validation des scores
        </h1>
        <button
          type="button"
          onClick={() => {
            saveSecret("");
            setSecret("");
            setMatches(null);
          }}
          className="min-h-11 text-sm font-semibold text-stone hover:text-chalk"
        >
          Se déconnecter
        </button>
      </div>

      <div role="tablist" className="flex gap-6 border-b border-line">
        {VIEWS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={view === value}
            onClick={() => {
              setMatches(null);
              setView(value);
            }}
            className={cn(
              "font-score -mb-px min-h-11 border-b-[3px] text-xl font-bold transition-colors",
              view === value
                ? "border-flag text-chalk"
                : "border-transparent text-stone hover:text-chalk"
            )}
          >
            {label}
            {view === value && matches && ` (${matches.length})`}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-stone">
        {view === "pending"
          ? "Scores pas affichés sur le site : une seule source peu sûre, ou deux clubs qui ne publient pas le même score. Validez (en corrigeant si besoin) ou rejetez."
          : view === "published"
            ? "Scores affichés automatiquement. Corrigez-en un ou retirez-le du site s'il est faux."
            : "Décisions déjà prises. Elles ne sont jamais écrasées par la collecte."}
      </p>

      {error ? (
        <p className="border-y border-line py-10 text-sm text-stone">
          Les scores n&apos;ont pas pu être chargés : {error}
        </p>
      ) : loading || !matches ? (
        <p className="border-y border-line py-10 text-sm text-stone">
          Chargement…
        </p>
      ) : matches.length === 0 ? (
        <p className="border-y border-line py-10 text-sm text-stone">
          Rien à afficher ici.
        </p>
      ) : (
        [...groups.entries()].map(([title, list]) => (
          <section key={title} className="mt-8">
            <h2 className="font-score rounded-[4px] bg-flag px-4 py-2 text-xl font-black text-ink">
              {title}
            </h2>
            <ul>
              {list.map(m => (
                <MatchReview
                  key={m.match_key}
                  match={m}
                  view={view}
                  onDecide={decide}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
