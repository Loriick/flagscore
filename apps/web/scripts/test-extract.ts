/**
 * Teste la lecture d'un post par Claude, en local, sur des captures d'écran.
 *
 * Usage (depuis apps/web) :
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/test-extract.ts \
 *     --account flashdelacourneuve --date 2026-11-09 \
 *     --caption "Retrouvez les résultats du week-end" \
 *     capture1.png [capture2.png ...]
 *
 * Affiche la lecture brute de Claude puis les observations rattachées au
 * calendrier. Coût avec Haiku 5.5 : une fraction de centime par post.
 */

import { readFileSync } from "node:fs";
import { extname } from "node:path";

import {
  extractPost,
  toObservations,
  type PostImage,
} from "../src/lib/social/extract";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const MEDIA_TYPES: Record<string, PostImage["mediaType"]> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function main() {
  const account = arg("account");
  const date = arg("date") ?? new Date().toISOString().slice(0, 10);
  const caption = arg("caption") ?? null;
  const flags = new Set(["--account", "--date", "--caption"]);
  const files = process.argv
    .slice(2)
    .filter((a, i, all) => !a.startsWith("--") && !flags.has(all[i - 1]));

  if (!account || files.length === 0) {
    console.error(
      'Usage : npx tsx scripts/test-extract.ts --account <compte> [--date YYYY-MM-DD] [--caption "..."] image1.png [...]'
    );
    process.exit(1);
  }

  const images: PostImage[] = files.map(f => ({
    data: readFileSync(f).toString("base64"),
    mediaType: MEDIA_TYPES[extname(f).toLowerCase()] ?? "image/jpeg",
  }));

  console.log(
    `Modèle : ${process.env.ANTHROPIC_MODEL || "claude-haiku-5-5"}\n`
  );
  const extraction = await extractPost({
    account,
    caption,
    postedAt: date,
    images,
  });
  console.log("Lecture de Claude :");
  console.log(JSON.stringify(extraction, null, 2));

  const { event, observations, skipped } = toObservations(
    "test",
    account,
    date,
    extraction
  );
  console.log("\nJournée :", event ?? `aucune (${skipped})`);
  for (const o of observations) {
    console.log(
      `  ${o.team} ${o.teamScore} - ${o.opponentScore} ${o.opponent}`
    );
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
