/**
 * Lecture d'un post Instagram (visuels + légende) par Claude, et conversion des
 * scores lus en observations pour le rapprochement (resolve.ts).
 *
 * Modèle : `ANTHROPIC_MODEL` (défaut : claude-haiku-5-5). Pour passer à Opus,
 * mettre `ANTHROPIC_MODEL=claude-opus-5-5` dans Vercel, sans changer le code.
 */

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";

import {
  competitionFromText,
  resolveEvent,
  type Competition,
  type CompetitionEvent,
} from "./calendar";
import type { Observation } from "./resolve";

export const DEFAULT_MODEL = "claude-haiku-5-5";

const ResultSchema = z.object({
  team: z
    .string()
    .describe(
      "Équipe du club qui publie, telle qu'écrite (garder la désignation : 'Flash A', 'Red'…)"
    ),
  opponent: z
    .string()
    .describe(
      "Adversaire, tel qu'écrit. Si seul un logo est visible, utiliser le nom donné dans la légende."
    ),
  team_score: z.number().int(),
  opponent_score: z.number().int(),
  slide: z
    .number()
    .int()
    .describe("Numéro du visuel (1 = premier) où figure ce score"),
  forfeit: z.boolean().describe("Le post indique un forfait pour ce match"),
  competition_text: z
    .string()
    .nullable()
    .describe(
      "Compétition de CE match telle qu'écrite (un post peut en mélanger plusieurs)"
    ),
  national_senior: z
    .boolean()
    .describe(
      "true seulement pour le Championnat de France (mixte) ou la Coupe de France seniors (masculins/féminines)"
    ),
});

export const ExtractionSchema = z.object({
  is_results_post: z
    .boolean()
    .describe("Le post annonce des scores de matchs terminés"),
  competition_text: z
    .string()
    .nullable()
    .describe(
      "Compétition telle qu'écrite (ex. 'Championnat de France Mixte')"
    ),
  stage_text: z
    .string()
    .nullable()
    .describe("Journée telle qu'écrite (ex. 'Qualification J2')"),
  match_date: z
    .string()
    .nullable()
    .describe(
      "Date des matchs au format YYYY-MM-DD, seulement si elle est écrite sur le post"
    ),
  results: z.array(ResultSchema),
  confidence: z
    .number()
    .describe(
      "Confiance globale entre 0 et 1 dans la lecture des équipes et des scores"
    ),
  notes: z
    .string()
    .nullable()
    .describe("Doute ou particularité à signaler à un humain"),
});

export type Extraction = z.infer<typeof ExtractionSchema>;

const SYSTEM_PROMPT = `Tu lis des posts Instagram de clubs français de flag football pour en extraire les résultats de matchs.

Le post est publié par le club indiqué. Pour chaque match terminé visible sur un visuel ou dans la légende :
- "team" est l'équipe du club qui publie, avec sa désignation exacte quand le club en a plusieurs (A/B, Red/Black…).
- "opponent" est l'adversaire. S'il n'apparaît que sous forme de logo, prends son nom dans la légende ; sinon décris-le au mieux (ex. "logo aigle") et baisse la confiance.
- Les scores sont orientés du point de vue de "team" : team_score est le score de l'équipe du club.
- Quand le club a plusieurs équipes et écrit seulement « Flash 00-43 Cougars » sous un titre de section (« Flash A »), reprends la désignation de la section : team = "Flash A". Garde les désignations par couleur telles quelles ("Red", "White", "Black").
- Un post peut mélanger plusieurs compétitions : renseigne competition_text pour chaque match. national_senior vaut true seulement pour le Championnat de France (mixte) et la Coupe de France seniors ; false pour les jeunes (U7 à U18), les championnats régionaux (ex. « championnat IDF »), les tournois et les matchs amicaux.

Les équipes seniors d'un club sont souvent désignées par une lettre (A, B, C) ou une couleur (Red, White, Black) ; les équipes jeunes par une catégorie d'âge (U7 à U18). Quand le contexte indique qu'une journée nationale vient d'avoir lieu, les résultats d'équipes désignées par une lettre ou une couleur appartiennent à cette compétition, sauf mention contraire (championnat régional, tournoi, amical).

Ne compte pas comme résultats : les bilans cumulés ("3-0" = 3 victoires, 0 défaite), les matchs à venir, les scores à la mi-temps, les classements.
Ne déduis pas de date : remplis match_date seulement si la date est écrite.
Si le post n'annonce aucun résultat, mets is_results_post à false et results à [].`;

export interface PostImage {
  /** Données de l'image encodées en base64. */
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
}

export interface PostInput {
  account: string;
  caption: string | null;
  /** Date de publication (ISO). */
  postedAt: string;
  images: PostImage[];
  /** Journées nationales qui viennent d'avoir lieu (voir recentEventsLabel). */
  context?: string | null;
}

export class ExtractionError extends Error {}

export async function extractPost(
  post: PostInput,
  client: Anthropic = new Anthropic()
): Promise<Extraction> {
  const content: Anthropic.ContentBlockParam[] = [];
  post.images.forEach((img, i) => {
    content.push({ type: "text", text: `Visuel ${i + 1} :` });
    content.push({
      type: "image",
      source: { type: "base64", media_type: img.mediaType, data: img.data },
    });
  });
  content.push({
    type: "text",
    text: [
      `Compte qui publie : @${post.account.replace(/^@/, "")}`,
      `Publié le : ${post.postedAt.slice(0, 10)}`,
      `Journées nationales juste avant la publication : ${post.context ?? "aucune"}`,
      `Légende :\n${post.caption?.trim() || "(aucune)"}`,
    ].join("\n"),
  });

  const response = await client.messages.parse({
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(ExtractionSchema) },
  });

  if (response.stop_reason === "refusal") {
    throw new ExtractionError(
      `Lecture refusée par le modèle (${response.stop_details?.category ?? "sans catégorie"})`
    );
  }
  if (response.stop_reason === "max_tokens") {
    throw new ExtractionError("Réponse tronquée (max_tokens atteint)");
  }
  if (!response.parsed_output) {
    throw new ExtractionError("Réponse illisible (JSON invalide)");
  }
  return response.parsed_output;
}

/** Télécharge une image (URL du CDN Instagram) et l'encode en base64. */
export async function fetchImage(url: string): Promise<PostImage> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Image ${res.status} : ${url}`);
  const type = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0];
  const mediaType = (
    ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type)
      ? type
      : "image/jpeg"
  ) as PostImage["mediaType"];
  const data = Buffer.from(await res.arrayBuffer()).toString("base64");
  return { data, mediaType };
}

export interface ToObservationsResult {
  event: CompetitionEvent | null;
  observations: Observation[];
  /** Pourquoi rien n'a été produit, le cas échéant. */
  skipped?: string;
}

/**
 * Convertit la lecture d'un post en observations, en retrouvant la journée de
 * compétition via le calendrier.
 */
export function toObservations(
  postId: string,
  account: string,
  postedAt: string,
  extraction: Extraction,
  calendar?: CompetitionEvent[]
): ToObservationsResult {
  // Seuls les matchs seniors nationaux (Championnat / Coupe de France) comptent.
  const results = extraction.results
    .map((r, index) => ({ ...r, index }))
    .filter(r => r.national_senior);
  if (!extraction.is_results_post || results.length === 0) {
    return {
      event: null,
      observations: [],
      skipped:
        extraction.results.length > 0
          ? "Aucun résultat de Championnat ou Coupe de France seniors"
          : "Pas de résultat",
    };
  }

  const competition: Competition | null = competitionFromText(
    [
      results[0].competition_text,
      extraction.competition_text,
      extraction.stage_text,
    ]
      .filter(Boolean)
      .join(" ")
  );
  const matchDate =
    extraction.match_date && /^\d{4}-\d{2}-\d{2}$/.test(extraction.match_date)
      ? extraction.match_date
      : null;

  const event = resolveEvent({
    postedOn: postedAt.slice(0, 10),
    matchDate,
    competition,
    calendar,
  });
  if (!event) {
    return {
      event: null,
      observations: [],
      skipped: "Journée de compétition introuvable dans le calendrier",
    };
  }

  const handle = account.replace(/^@/, "").toLowerCase();
  const observations: Observation[] = results.map(r => ({
    id: `${postId}#${r.index}`,
    postId,
    account: handle,
    event,
    team: r.team,
    opponent: r.opponent,
    teamScore: r.team_score,
    opponentScore: r.opponent_score,
    confidence: Math.max(0, Math.min(1, extraction.confidence)),
  }));

  return { event, observations };
}
