import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type Actor,
  applyCommand,
  REQUIRED_SIGNATURES,
  resultFromRow,
  resultToRow,
  type Sheet,
  type SheetResult,
  type SheetStatus,
  type Side,
  type Signature,
  type SignerRole,
} from "./machine";
import { publishSheet, unpublishSheet } from "./publish";

/**
 * Lecture et écriture des feuilles en base (clé service_role), partagées par
 * l'app matchs et l'admin. Les règles viennent de `applyCommand` ; ici on ne
 * fait que traduire une transition acceptée en écritures.
 *
 * Concurrence : `version` change à chaque nouveau score. Une écriture faite
 * sur une version dépassée échoue (« la feuille a changé »), et une signature
 * posée sur une ancienne version ne compte pas.
 */

export interface PlateauRow {
  id: string;
  event_key: string;
  pool_id: number;
  date: string;
  venue: string;
  host_club: string | null;
}

export interface SheetRow {
  id: string;
  plateau_id: string;
  match_key: string;
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  forfeit: Side | null;
  status: SheetStatus;
  version: number;
  signed_at: string | null;
}

export interface SignatureRow {
  sheet_id: string;
  side: Side;
  role: SignerRole;
  signer_name: string;
  signature_svg: string;
  sheet_version: number;
  signed_at: string;
}

export interface InjuryRow {
  id: string;
  sheet_id: string;
  side: Side;
  player_name: string;
  jersey_number: string | null;
  moment: string | null;
  created_at: string;
}

export const PLATEAU_COLUMNS = "id, event_key, pool_id, date, venue, host_club";
export const SHEET_COLUMNS =
  "id, plateau_id, match_key, team_home, team_away, score_home, score_away, forfeit, status, version, signed_at";
const SIGNATURE_COLUMNS =
  "sheet_id, side, role, signer_name, signature_svg, sheet_version, signed_at";
const INJURY_COLUMNS =
  "id, sheet_id, side, player_name, jersey_number, moment, created_at";

export class SheetError extends Error {}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export async function audit(
  db: SupabaseClient,
  entry: {
    actor: string;
    action: string;
    entity: string;
    entityId: string;
    details?: Record<string, unknown>;
  }
) {
  check(
    await db.from("audit_log").insert({
      actor: entry.actor,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId,
      details: entry.details ?? null,
    })
  );
}

export interface SheetBundle {
  row: SheetRow;
  plateau: PlateauRow;
  /** Signatures de la version actuelle seulement. */
  signatures: SignatureRow[];
  injuries: InjuryRow[];
  sheet: Sheet;
}

export function toSheet(row: SheetRow, signatures: SignatureRow[]): Sheet {
  return {
    status: row.status,
    result: resultFromRow(row),
    signedAt: row.signed_at,
    signatures: signatures.map(s => ({
      side: s.side,
      role: s.role,
      signerName: s.signer_name,
      path: s.signature_svg,
    })),
  };
}

export async function loadSheets(
  db: SupabaseClient,
  plateauIds: string[]
): Promise<
  Array<{ row: SheetRow; signatures: SignatureRow[]; injuries: InjuryRow[] }>
> {
  if (plateauIds.length === 0) return [];
  const rows = check(
    await db
      .from("match_sheets")
      .select(SHEET_COLUMNS)
      .in("plateau_id", plateauIds)
      .order("created_at")
  ) as SheetRow[];
  const ids = rows.map(r => r.id);
  const [signatures, injuries] = ids.length
    ? await Promise.all([
        db
          .from("sheet_signatures")
          .select(SIGNATURE_COLUMNS)
          .in("sheet_id", ids),
        db
          .from("injuries")
          .select(INJURY_COLUMNS)
          .in("sheet_id", ids)
          .order("created_at"),
      ]).then(
        ([s, i]) =>
          [check(s) as SignatureRow[], check(i) as InjuryRow[]] as const
      )
    : [[], []];
  return rows.map(row => ({
    row,
    signatures: signatures.filter(
      s => s.sheet_id === row.id && s.sheet_version === row.version
    ),
    injuries: injuries.filter(i => i.sheet_id === row.id),
  }));
}

export async function loadSheet(
  db: SupabaseClient,
  sheetId: string
): Promise<SheetBundle | null> {
  const row = check(
    await db
      .from("match_sheets")
      .select(SHEET_COLUMNS)
      .eq("id", sheetId)
      .maybeSingle()
  ) as SheetRow | null;
  if (!row) return null;
  const plateau = check(
    await db
      .from("plateaux")
      .select(PLATEAU_COLUMNS)
      .eq("id", row.plateau_id)
      .single()
  ) as PlateauRow;
  const [loaded] = await loadSheets(db, [row.plateau_id]).then(all =>
    all.filter(s => s.row.id === sheetId)
  );
  return {
    ...loaded,
    plateau,
    sheet: toSheet(loaded.row, loaded.signatures),
  };
}

function accept(
  sheet: Sheet,
  command: Parameters<typeof applyCommand>[1],
  actor: Actor
) {
  const t = applyCommand(sheet, command, actor, new Date());
  if (!t.ok) throw new SheetError(t.error);
  return t;
}

const CHANGED = "La feuille a changé entre-temps. Recharge la page.";

export async function saveResult(
  db: SupabaseClient,
  bundle: SheetBundle,
  result: SheetResult,
  actorId: string
) {
  const t = accept(bundle.sheet, { type: "setResult", result }, "delegate");
  const updated = check(
    await db
      .from("match_sheets")
      .update({
        ...resultToRow(t.sheet.result),
        version: bundle.row.version + 1,
      })
      .eq("id", bundle.row.id)
      .eq("version", bundle.row.version)
      .eq("status", "draft")
      .select("id")
  );
  if (!updated?.length) throw new SheetError(CHANGED);
  check(
    await db.from("sheet_signatures").delete().eq("sheet_id", bundle.row.id)
  );
  await audit(db, {
    actor: actorId,
    action: "sheet.result",
    entity: "match_sheet",
    entityId: bundle.row.id,
    details: { result, signaturesCleared: t.signaturesCleared },
  });
}

/** Renvoie true quand la feuille est signée et son score publié. */
export async function saveSignature(
  db: SupabaseClient,
  bundle: SheetBundle,
  signature: Signature,
  actorId: string
): Promise<boolean> {
  accept(bundle.sheet, { type: "sign", signature }, "delegate");
  const { version } = bundle.row;
  check(
    await db.from("sheet_signatures").upsert(
      {
        sheet_id: bundle.row.id,
        side: signature.side,
        role: signature.role,
        signer_name: signature.signerName,
        signature_svg: signature.path,
        sheet_version: version,
        signed_at: new Date().toISOString(),
      },
      { onConflict: "sheet_id,side,role" }
    )
  );
  await audit(db, {
    actor: actorId,
    action: "sheet.sign",
    entity: "match_sheet",
    entityId: bundle.row.id,
    details: {
      side: signature.side,
      role: signature.role,
      signer: signature.signerName,
    },
  });

  // Recompte depuis la base : deux téléphones peuvent signer en même temps.
  const current = check(
    await db
      .from("sheet_signatures")
      .select("side, role")
      .eq("sheet_id", bundle.row.id)
      .eq("sheet_version", version)
  ) as Array<{ side: Side; role: SignerRole }>;
  const complete = REQUIRED_SIGNATURES.every(([side, role]) =>
    current.some(s => s.side === side && s.role === role)
  );
  if (!complete) return false;

  const signed = check(
    await db
      .from("match_sheets")
      .update({ status: "signed", signed_at: new Date().toISOString() })
      .eq("id", bundle.row.id)
      .eq("version", version)
      .eq("status", "draft")
      .select(SHEET_COLUMNS)
  ) as SheetRow[];
  // Une autre requête a conclu, ou le score a changé entre-temps.
  if (!signed.length) return isPublished(db, bundle.row.id, version);
  try {
    await publishSheet(db, signed[0], bundle.plateau);
  } catch {
    // Jamais « signée » sans être publiée : on revient au brouillon, les
    // signatures restent et la suivante relance la publication.
    check(
      await db
        .from("match_sheets")
        .update({ status: "draft", signed_at: null })
        .eq("id", bundle.row.id)
        .eq("version", version)
        .eq("status", "signed")
    );
    throw new SheetError(PUBLISH_FAILED);
  }
  await audit(db, {
    actor: actorId,
    action: "sheet.signed",
    entity: "match_sheet",
    entityId: bundle.row.id,
    details: { match_key: bundle.row.match_key },
  });
  return true;
}

const PUBLISH_FAILED =
  "Le score n'a pas pu être publié. La feuille n'est pas signée : refais la dernière signature.";

/** La feuille est signée à cette version et son score est sur le site. */
async function isPublished(
  db: SupabaseClient,
  sheetId: string,
  version: number
) {
  const sheet = check(
    await db
      .from("match_sheets")
      .select(SHEET_COLUMNS)
      .eq("id", sheetId)
      .maybeSingle()
  ) as SheetRow | null;
  if (sheet?.status !== "signed" || sheet.version !== version) return false;
  const published = check(
    await db
      .from("social_matches")
      .select("match_key")
      .eq("match_key", sheet.match_key)
      .eq("source", "delegate")
      .eq("review", "approved")
  ) as Array<{ match_key: string }>;
  return published.length > 0;
}

export async function reopenSheet(
  db: SupabaseClient,
  bundle: SheetBundle,
  actorId: string
) {
  accept(bundle.sheet, { type: "reopen" }, "admin");
  const updated = check(
    await db
      .from("match_sheets")
      .update({
        status: "draft",
        signed_at: null,
        version: bundle.row.version + 1,
      })
      .eq("id", bundle.row.id)
      .eq("status", "signed")
      .select("id")
  );
  if (!updated?.length) throw new SheetError(CHANGED);
  check(
    await db.from("sheet_signatures").delete().eq("sheet_id", bundle.row.id)
  );
  await unpublishSheet(db, bundle.row.match_key);
  await audit(db, {
    actor: actorId,
    action: "sheet.reopen",
    entity: "match_sheet",
    entityId: bundle.row.id,
    details: { match_key: bundle.row.match_key },
  });
}
