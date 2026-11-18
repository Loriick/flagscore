import { z } from "zod";

/** Entrées des formulaires, validées côté serveur avant tout accès à la base. */

const side = z.enum(["home", "away"]);
const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform(v => v || null)
    .nullish()
    .transform(v => v ?? null);
const score = z.coerce.number().int().min(0).max(300);
const uuid = z.uuid();

export const resultInput = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("score"), home: score, away: score }),
  z.object({ kind: z.literal("forfeit"), side }),
]);

/** Tracé du pad : commandes M/L et nombres seulement, moins de 50 Ko. */
export const signaturePath = z
  .string()
  .max(50_000)
  .regex(/^M[\d\s.,MLml-]+$/, "Signature invalide");

export const signatureInput = z.object({
  side,
  role: z.enum(["coach", "captain"]),
  signerName: text(80),
  path: signaturePath,
});

export const injuryInput = z.object({
  side,
  playerName: text(80),
  jerseyNumber: optionalText(4),
  moment: optionalText(80),
});

export const newSheetInput = z.object({
  teamA: text(120),
  teamB: text(120),
});

export const plateauInput = z.object({
  poolId: z.coerce.number().int().positive(),
  eventKey: text(80),
  date: z.iso.date(),
  venue: text(160),
  hostClub: optionalText(120),
});

export const inviteInput = z.object({
  plateauId: uuid,
  fullName: text(120),
  email: z.email().trim().toLowerCase(),
});

export const idInput = uuid;
