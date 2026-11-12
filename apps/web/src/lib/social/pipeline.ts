/**
 * Pipeline complet : collecte (Apify) → lecture (Claude) → rapprochement →
 * scores retenus (`social_matches`).
 *
 * Chaque étape est rejouable : elle ne traite que ce qui reste à faire et
 * s'arrête avant la limite de temps d'une fonction Vercel.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  FINISHED_FAILED,
  getRun,
  getRunPosts,
  postAccount,
  postImageUrls,
  startInstagramRun,
  type ApifyPost,
} from "./apify";
import {
  addDays,
  recentEventsLabel,
  type Competition,
  type CompetitionEvent,
} from "./calendar";
import { CLUB_INSTAGRAM } from "./data/pools-2026-2027";
import {
  extractPost,
  fetchImage,
  toObservations,
  type Extraction,
  type PostImage,
  type PostInput,
} from "./extract";
import { reconcile, type MatchDecision } from "./reconcile";
import {
  eventKey,
  resolveObservations,
  type Observation,
  type ResolvedObservation,
} from "./resolve";
import { collectionWindow } from "./schedule";
import { buildSeasonDirectory } from "./season";
import type { TeamDirectory } from "./teams";

// --- Lignes de base de données ----------------------------------------------

export interface SocialPostRow {
  id: string;
  run_id: string | null;
  account: string;
  permalink: string;
  posted_at: string;
  caption: string | null;
  media_type: string | null;
  image_urls: string[];
  status: "pending" | "processed" | "ignored" | "error";
  attempts: number;
}

export interface ObservationRow {
  id: string;
  post_id: string;
  account: string;
  event_key: string;
  competition: Competition;
  stage: string;
  event_start: string;
  event_end: string;
  team_raw: string;
  opponent_raw: string;
  team_score: number;
  opponent_score: number;
  confidence: number;
  resolution?: string | null;
  match_key?: string | null;
  inferred?: boolean;
  options?: unknown;
}

// --- Conversions (pures, testées) ---------------------------------------------

/** Comptes suivis : tous ceux renseignés dans CLUB_INSTAGRAM. */
export function followedAccounts(
  instagram: Record<string, string[]> = CLUB_INSTAGRAM
): string[] {
  return [
    ...new Set(
      Object.values(instagram)
        .flat()
        .map(h => h.replace(/^@/, "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}

export function toPostRow(
  post: ApifyPost,
  runId: string | null
): Omit<SocialPostRow, "status" | "attempts"> {
  return {
    id: post.id,
    run_id: runId,
    account: postAccount(post),
    permalink: post.url,
    posted_at: post.timestamp,
    caption: post.caption ?? null,
    media_type: post.type ?? null,
    image_urls: postImageUrls(post),
  };
}

export function toObservationRow(o: Observation): ObservationRow {
  return {
    id: o.id,
    post_id: o.postId,
    account: o.account,
    event_key: eventKey(o.event),
    competition: o.event.competition,
    stage: o.event.stage,
    event_start: o.event.start,
    event_end: o.event.end,
    team_raw: o.team,
    opponent_raw: o.opponent,
    team_score: o.teamScore,
    opponent_score: o.opponentScore,
    confidence: o.confidence,
  };
}

export function fromObservationRow(r: ObservationRow): Observation {
  const event: CompetitionEvent = {
    competition: r.competition,
    stage: r.stage,
    start: r.event_start,
    end: r.event_end,
  };
  return {
    id: r.id,
    postId: r.post_id,
    account: r.account,
    event,
    team: r.team_raw,
    opponent: r.opponent_raw,
    teamScore: r.team_score,
    opponentScore: r.opponent_score,
    confidence: r.confidence,
  };
}

export function toSocialMatchRow(
  d: MatchDecision,
  event: CompetitionEvent
): Record<string, unknown> {
  // `review` n'est jamais envoyé : une décision humaine n'est pas écrasée.
  return {
    match_key: d.matchKey,
    event_key: eventKey(event),
    competition: event.competition,
    stage: event.stage,
    event_start: event.start,
    event_end: event.end,
    match_id: d.matchId ?? null,
    team_home: d.home,
    team_away: d.away,
    score_home: d.scoreHome ?? null,
    score_away: d.scoreAway ?? null,
    status: d.status,
    auto_apply: d.autoApply,
    reason: d.reason,
    accounts: d.accounts,
    observation_ids: d.observationIds,
  };
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// --- 1. Lancer la collecte ----------------------------------------------------

export interface StartResult {
  started: boolean;
  runId?: string;
  since?: string;
  accounts?: number;
  reason?: string;
}

export async function startCollection(
  db: SupabaseClient,
  {
    today,
    force = false,
    since: sinceOverride,
  }: {
    today: string;
    force?: boolean;
    /** Rattrapage : collecter les posts depuis cette date (YYYY-MM-DD). */
    since?: string;
  }
): Promise<StartResult> {
  const window = collectionWindow(today);
  if (!window && !force && !sinceOverride) {
    return { started: false, reason: "Pas de journée de compétition récente" };
  }
  const since = sinceOverride ?? window?.since ?? addDays(today, -4);

  const running = check(
    await db.from("social_runs").select("id").eq("status", "started")
  ) as Array<{ id: string }>;
  if (running.length > 0 && !force && !sinceOverride) {
    return {
      started: false,
      reason: `Collecte déjà en cours (${running[0].id})`,
    };
  }

  const accounts = followedAccounts();
  if (accounts.length === 0) {
    return { started: false, reason: "Aucun compte Instagram à suivre" };
  }

  // Un rattrapage couvre plusieurs semaines : on remonte plus de posts.
  const run = await startInstagramRun(accounts, since, {
    resultsLimit: sinceOverride ? 40 : 20,
  });
  check(
    await db
      .from("social_runs")
      .insert({ id: run.id, since, accounts, status: "started" })
  );
  return { started: true, runId: run.id, since, accounts: accounts.length };
}

// --- 2. Récupérer les posts des collectes terminées ---------------------------

export async function collectFinishedRuns(db: SupabaseClient) {
  const runs = check(
    await db.from("social_runs").select("id, since").eq("status", "started")
  ) as Array<{ id: string; since: string }>;

  let posts = 0;
  let failed = 0;
  let pending = 0;
  for (const r of runs) {
    const run = await getRun(r.id);
    if (run.status === "SUCCEEDED") {
      const items = (await getRunPosts(run.defaultDatasetId)).filter(
        // L'Actor peut renvoyer des posts épinglés plus anciens.
        p => p.timestamp.slice(0, 10) >= r.since
      );
      if (items.length > 0) {
        check(
          await db.from("social_posts").upsert(
            items.map(p => toPostRow(p, r.id)),
            { onConflict: "id", ignoreDuplicates: true }
          )
        );
      }
      check(
        await db
          .from("social_runs")
          .update({
            status: "collected",
            posts_count: items.length,
            finished_at: new Date().toISOString(),
          })
          .eq("id", r.id)
      );
      posts += items.length;
    } else if (FINISHED_FAILED.includes(run.status)) {
      check(
        await db
          .from("social_runs")
          .update({
            status: "failed",
            error: run.status,
            finished_at: new Date().toISOString(),
          })
          .eq("id", r.id)
      );
      failed++;
    } else {
      pending++;
    }
  }
  return { runs: runs.length, posts, failed, stillRunning: pending };
}

/** Un score dans un texte : « 18 - 0 », « 40:25 », « 07-42 ». */
export const SCORE_PATTERN = /\b\d{1,3}\s*[-–:]\s*\d{1,3}\b/;

/** Nombre maximal de visuels lus par post. */
const MAX_IMAGES = 4;

// --- 3. Lire les posts en attente ----------------------------------------------

export interface ProcessOptions {
  /** Timestamp (ms) au-delà duquel on ne commence plus de nouveau post. */
  deadline: number;
  concurrency?: number;
  maxAttempts?: number;
  extract?: (post: PostInput) => Promise<Extraction>;
  loadImage?: (url: string) => Promise<PostImage>;
}

export async function processPendingPosts(
  db: SupabaseClient,
  {
    deadline,
    concurrency = 6,
    maxAttempts = 3,
    extract = extractPost,
    loadImage = fetchImage,
  }: ProcessOptions
) {
  const events = new Set<string>();
  const stats = { processed: 0, ignored: 0, errors: 0 };
  const seen = new Set<string>();

  while (Date.now() < deadline) {
    const batch = (
      check(
        await db
          .from("social_posts")
          .select("*")
          .eq("status", "pending")
          .lt("attempts", maxAttempts)
          .order("posted_at", { ascending: true })
          .limit(concurrency + seen.size)
      ) as SocialPostRow[]
    ).filter(p => !seen.has(p.id));
    if (batch.length === 0) break;
    const current = batch.slice(0, concurrency);
    current.forEach(p => seen.add(p.id));

    await Promise.all(
      current.map(async post => {
        try {
          // Vidéo sans score dans la légende : rien à lire, inutile d'appeler Claude.
          if (
            post.media_type === "Video" &&
            !SCORE_PATTERN.test(post.caption ?? "")
          ) {
            check(
              await db
                .from("social_posts")
                .update({
                  status: "ignored",
                  skipped_reason: "Vidéo sans score dans la légende",
                  processed_at: new Date().toISOString(),
                })
                .eq("id", post.id)
            );
            stats.ignored++;
            return;
          }
          // Les scores sont dans les premiers visuels d'un carrousel.
          const images = (
            await Promise.allSettled(
              post.image_urls.slice(0, MAX_IMAGES).map(u => loadImage(u))
            )
          )
            .filter(
              (r): r is PromiseFulfilledResult<PostImage> =>
                r.status === "fulfilled"
            )
            .map(r => r.value);
          if (images.length === 0 && !post.caption) {
            throw new Error("Aucune image téléchargeable et pas de légende");
          }

          const extraction = await extract({
            account: post.account,
            caption: post.caption,
            postedAt: post.posted_at,
            images,
            context: recentEventsLabel(post.posted_at.slice(0, 10)),
          });
          const { event, observations, skipped } = toObservations(
            post.id,
            post.account,
            post.posted_at,
            extraction
          );

          if (event && observations.length > 0) {
            check(
              await db
                .from("score_observations")
                .upsert(observations.map(toObservationRow), {
                  onConflict: "id",
                })
            );
            events.add(eventKey(event));
          }
          check(
            await db
              .from("social_posts")
              .update({
                status: observations.length > 0 ? "processed" : "ignored",
                extraction,
                event_key: event ? eventKey(event) : null,
                skipped_reason: skipped ?? null,
                error: null,
                processed_at: new Date().toISOString(),
              })
              .eq("id", post.id)
          );
          if (observations.length > 0) stats.processed++;
          else stats.ignored++;
        } catch (err) {
          const attempts = post.attempts + 1;
          await db
            .from("social_posts")
            .update({
              attempts,
              status: attempts >= maxAttempts ? "error" : "pending",
              error: err instanceof Error ? err.message : String(err),
            })
            .eq("id", post.id);
          stats.errors++;
        }
      })
    );
  }

  return { ...stats, events: [...events] };
}

// --- 4. Rapprocher et retenir les scores --------------------------------------

export async function reconcileEvents(
  db: SupabaseClient,
  eventKeys: string[]
): Promise<{ events: number; matches: number; pendingReview: number }> {
  if (eventKeys.length === 0)
    return { events: 0, matches: 0, pendingReview: 0 };

  const aliases = check(
    await db.from("team_aliases").select("alias, team, competition")
  ) as Array<{ alias: string; team: string; competition: Competition }>;
  const cache = new Map<Competition, TeamDirectory>();
  const forEvent = (e: CompetitionEvent) => {
    if (!cache.has(e.competition)) {
      cache.set(
        e.competition,
        buildSeasonDirectory(e.competition, {
          aliases: aliases.filter(a => a.competition === e.competition),
        })
      );
    }
    return cache.get(e.competition)!;
  };

  let matches = 0;
  let pendingReview = 0;
  for (const key of eventKeys) {
    const rows = check(
      await db.from("score_observations").select("*").eq("event_key", key)
    ) as ObservationRow[];
    if (rows.length === 0) continue;

    const observations = rows.map(fromObservationRow);
    const resolved: ResolvedObservation[] = resolveObservations(
      observations,
      forEvent
    );

    // Résultat du rapprochement sur chaque observation (pour l'admin).
    const byId = new Map(resolved.map(r => [r.observation.id, r]));
    check(
      await db.from("score_observations").upsert(
        rows.map(row => {
          const r = byId.get(row.id)!;
          return {
            ...row,
            resolution: r.status,
            match_key: r.matchKey ?? null,
            inferred: r.inferred ?? false,
            options: r.options ?? null,
          };
        }),
        { onConflict: "id" }
      )
    );

    const event = observations[0].event;
    const decisions = reconcile(resolved);
    if (decisions.length > 0) {
      check(
        await db.from("social_matches").upsert(
          decisions.map(d => toSocialMatchRow(d, event)),
          { onConflict: "match_key" }
        )
      );
    }

    // Matchs qui n'existent plus après ce passage (ex. alias corrigé), sauf
    // ceux qu'un humain a déjà revus.
    const keep = decisions.map(d => d.matchKey);
    let stale = db
      .from("social_matches")
      .delete()
      .eq("event_key", key)
      .is("review", null);
    if (keep.length > 0) {
      stale = stale.not(
        "match_key",
        "in",
        `(${keep.map(k => `"${k.replace(/"/g, '\\"')}"`).join(",")})`
      );
    }
    check(await stale);

    matches += decisions.length;
    pendingReview +=
      decisions.filter(d => !d.autoApply).length +
      resolved.filter(r => r.status !== "resolved").length;
  }
  return { events: eventKeys.length, matches, pendingReview };
}

/** Journées ayant des observations depuis `since` (YYYY-MM-DD). */
export async function recentEventKeys(
  db: SupabaseClient,
  since: string
): Promise<string[]> {
  const rows = check(
    await db
      .from("score_observations")
      .select("event_key")
      .gte("event_start", since)
  ) as Array<{ event_key: string }>;
  return [...new Set(rows.map(r => r.event_key))];
}
