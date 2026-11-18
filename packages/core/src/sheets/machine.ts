/**
 * Feuille de match saisie au bord du terrain par le délégué, puis signée par
 * les deux coachs et les deux capitaines.
 *
 *   draft  --setResult-->  draft    (efface les signatures)
 *   draft  --sign-->       draft    (ajoute ou remplace une signature)
 *   draft  --4e signature--> signed (automatique)
 *   signed --reopen-->     draft    (admin seulement, efface les signatures)
 *   signed --setResult/sign--> refus
 *
 * Les blessés ne passent pas par ici : ils n'invalident pas la feuille.
 */

export type Side = "home" | "away";
export type SignerRole = "coach" | "captain";
export type SheetStatus = "draft" | "signed";

export const SIDES: readonly Side[] = ["home", "away"];

export const REQUIRED_SIGNATURES: ReadonlyArray<readonly [Side, SignerRole]> = [
  ["home", "coach"],
  ["home", "captain"],
  ["away", "coach"],
  ["away", "captain"],
];

/** Score saisi, ou forfait d'une équipe (sans score conventionnel inventé). */
export type SheetResult =
  | { kind: "score"; home: number; away: number }
  | { kind: "forfeit"; side: Side };

export interface Signature {
  side: Side;
  role: SignerRole;
  signerName: string;
  /** Attribut `d` d'un `<path>` SVG, jamais du balisage. */
  path: string;
}

export interface Sheet {
  status: SheetStatus;
  result: SheetResult | null;
  signatures: Signature[];
  signedAt: string | null;
}

export type SheetCommand =
  | { type: "setResult"; result: SheetResult }
  | { type: "sign"; signature: Signature }
  | { type: "reopen" };

export type Actor = "delegate" | "admin";

export type Transition =
  | {
      ok: true;
      sheet: Sheet;
      /** Les signatures existantes ont été effacées. */
      signaturesCleared: boolean;
      /** La feuille vient de passer à « signée » : publier le score. */
      becameSigned: boolean;
    }
  | { ok: false; error: string };

const refuse = (error: string): Transition => ({ ok: false, error });

export const emptySheet = (): Sheet => ({
  status: "draft",
  result: null,
  signatures: [],
  signedAt: null,
});

export const canSign = (sheet: Sheet) =>
  sheet.status === "draft" && sheet.result !== null;

export const hasSignature = (sheet: Sheet, side: Side, role: SignerRole) =>
  sheet.signatures.some(s => s.side === side && s.role === role);

export const signatureCount = (sheet: Sheet) =>
  REQUIRED_SIGNATURES.filter(([side, role]) => hasSignature(sheet, side, role))
    .length;

export const missingSignatures = (sheet: Sheet) =>
  REQUIRED_SIGNATURES.filter(
    ([side, role]) => !hasSignature(sheet, side, role)
  );

export function applyCommand(
  sheet: Sheet,
  command: SheetCommand,
  actor: Actor,
  now: Date
): Transition {
  switch (command.type) {
    case "setResult": {
      if (sheet.status === "signed") {
        return refuse(
          "Feuille signée : elle doit être rouverte par un admin pour être modifiée."
        );
      }
      return {
        ok: true,
        sheet: { ...sheet, result: command.result, signatures: [] },
        signaturesCleared: sheet.signatures.length > 0,
        becameSigned: false,
      };
    }
    case "sign": {
      if (sheet.status === "signed") {
        return refuse("Feuille déjà signée par les quatre signataires.");
      }
      if (!canSign(sheet)) {
        return refuse("Saisis le score ou le forfait avant les signatures.");
      }
      const { side, role } = command.signature;
      const signatures = [
        ...sheet.signatures.filter(s => !(s.side === side && s.role === role)),
        command.signature,
      ];
      const complete = REQUIRED_SIGNATURES.every(([sd, r]) =>
        signatures.some(s => s.side === sd && s.role === r)
      );
      return {
        ok: true,
        sheet: {
          ...sheet,
          signatures,
          status: complete ? "signed" : "draft",
          signedAt: complete ? now.toISOString() : null,
        },
        signaturesCleared: false,
        becameSigned: complete,
      };
    }
    case "reopen": {
      if (actor !== "admin")
        return refuse("Seul un admin peut rouvrir une feuille.");
      if (sheet.status !== "signed")
        return refuse("La feuille n'est pas signée.");
      return {
        ok: true,
        sheet: { ...sheet, status: "draft", signatures: [], signedAt: null },
        signaturesCleared: true,
        becameSigned: false,
      };
    }
  }
}

/** Colonnes `match_sheets` ↔ résultat. */
export function resultFromRow(row: {
  score_home: number | null;
  score_away: number | null;
  forfeit: Side | null;
}): SheetResult | null {
  if (row.forfeit) return { kind: "forfeit", side: row.forfeit };
  if (row.score_home === null || row.score_away === null) return null;
  return { kind: "score", home: row.score_home, away: row.score_away };
}

export function resultToRow(result: SheetResult | null) {
  if (!result) return { score_home: null, score_away: null, forfeit: null };
  return result.kind === "forfeit"
    ? { score_home: null, score_away: null, forfeit: result.side }
    : { score_home: result.home, score_away: result.away, forfeit: null };
}
