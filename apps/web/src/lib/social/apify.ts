/**
 * Source des posts : l'Actor Apify « apify/instagram-scraper ».
 *
 * Fonctionnement en deux temps (un passage complet peut prendre plusieurs
 * minutes, plus que la durée max d'une fonction Vercel) :
 *  1. `startInstagramRun` lance l'Actor en arrière-plan et renvoie l'id du run ;
 *  2. plus tard, `getRun` + `getRunPosts` récupèrent le résultat.
 *
 * Jeton : variable d'environnement APIFY_TOKEN (console.apify.com →
 * Settings → API & Integrations).
 */

const API = "https://api.apify.com/v2";
const ACTOR = "apify~instagram-scraper";

/** Un post tel que renvoyé par l'Actor (champs utilisés seulement). */
export interface ApifyPost {
  id: string;
  shortCode?: string;
  url: string;
  ownerUsername: string;
  /** Profil demandé qui a produit ce post (diffère de l'auteur en collaboration). */
  inputUrl?: string | null;
  /** ISO 8601 (UTC) */
  timestamp: string;
  caption?: string | null;
  type: "Image" | "Sidecar" | "Video" | string;
  displayUrl?: string | null;
  images?: string[] | null;
  childPosts?: Array<{ type?: string; displayUrl?: string | null }> | null;
  isPinned?: boolean;
}

export type ApifyRunStatus =
  | "READY"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "TIMING-OUT"
  | "TIMED-OUT"
  | "ABORTING"
  | "ABORTED";

export interface ApifyRun {
  id: string;
  status: ApifyRunStatus;
  defaultDatasetId: string;
}

export class ApifyError extends Error {}

function token(): string {
  const t = process.env.APIFY_TOKEN;
  if (!t) throw new ApifyError("APIFY_TOKEN manquant");
  return t;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new ApifyError(
      `Apify ${res.status} sur ${path} : ${body.slice(0, 300)}`
    );
  }
  return res.json() as Promise<T>;
}

/**
 * Compte du club pour un post : le profil scrapé (`inputUrl`) plutôt que
 * l'auteur, car un post en collaboration (ex. avec un photographe) a pour
 * auteur le collaborateur alors qu'il parle bien des équipes du club.
 */
export function postAccount(post: ApifyPost): string {
  const m = post.inputUrl?.match(/instagram\.com\/([^/?#]+)/i);
  return (m ? m[1] : post.ownerUsername).replace(/^@/, "").toLowerCase();
}

export function profileUrl(handle: string): string {
  return `https://www.instagram.com/${handle.replace(/^@/, "").trim()}/`;
}

/**
 * Lance la récupération des posts publiés depuis `since` (YYYY-MM-DD, UTC)
 * pour une liste de comptes.
 */
export async function startInstagramRun(
  handles: string[],
  since: string,
  { resultsLimit = 20 }: { resultsLimit?: number } = {}
): Promise<ApifyRun> {
  const { data } = await call<{ data: ApifyRun }>(`/acts/${ACTOR}/runs`, {
    method: "POST",
    body: JSON.stringify({
      resultsType: "posts",
      directUrls: handles.map(profileUrl),
      resultsLimit,
      onlyPostsNewerThan: since,
      addParentData: false,
    }),
  });
  return data;
}

export async function getRun(runId: string): Promise<ApifyRun> {
  const { data } = await call<{ data: ApifyRun }>(`/actor-runs/${runId}`);
  return data;
}

export async function getRunPosts(datasetId: string): Promise<ApifyPost[]> {
  const items = await call<unknown[]>(
    `/datasets/${datasetId}/items?clean=true&format=json`
  );
  return items.filter(isPost);
}

function isPost(item: unknown): item is ApifyPost {
  const p = item as Partial<ApifyPost>;
  return (
    typeof p?.id === "string" &&
    typeof p.ownerUsername === "string" &&
    typeof p.timestamp === "string"
  );
}

export const FINISHED_FAILED: ApifyRunStatus[] = [
  "FAILED",
  "TIMED-OUT",
  "ABORTED",
];

/**
 * Images à lire pour un post : toutes celles d'un carrousel (10 max), sinon
 * l'image principale (miniature pour une vidéo).
 */
export function postImageUrls(post: ApifyPost, max = 10): string[] {
  const fromChildren = (post.childPosts ?? [])
    .filter(c => c.type !== "Video" && c.displayUrl)
    .map(c => c.displayUrl as string);
  const urls =
    fromChildren.length > 0
      ? fromChildren
      : (post.images ?? []).length > 0
        ? (post.images as string[])
        : post.displayUrl
          ? [post.displayUrl]
          : [];
  return [...new Set(urls)].slice(0, max);
}
