import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import {
  poolMatch,
  publishedRows,
  type SocialMatchRow,
  socialPools,
  socialPoolTeams,
} from "../../social/results";
import {
  loadSheet,
  REQUIRED_SIGNATURES,
  reopenSheet,
  saveResult,
  saveSignature,
  SheetError,
} from "..";

type Row = Record<string, unknown>;

/**
 * Base en mémoire qui imite le sous-ensemble du client Supabase utilisé par
 * le store : filtres eq/in, insert/update/upsert/delete, select en retour.
 */
function memoryDb(tables: Record<string, Row[]>) {
  class Query {
    private filters: Array<(r: Row) => boolean> = [];
    private op: "select" | "insert" | "update" | "upsert" | "delete" = "select";
    private values: Row[] = [];
    private conflict: string[] = [];
    private mode: "many" | "one" | "maybe" = "many";
    constructor(private table: string) {
      tables[table] ??= [];
    }
    select() {
      return this;
    }
    order() {
      return this;
    }
    eq(column: string, value: unknown) {
      this.filters.push(r => r[column] === value);
      return this;
    }
    in(column: string, values: unknown[]) {
      this.filters.push(r => values.includes(r[column]));
      return this;
    }
    single() {
      this.mode = "one";
      return this;
    }
    maybeSingle() {
      this.mode = "maybe";
      return this;
    }
    insert(row: Row | Row[]) {
      this.op = "insert";
      this.values = [row].flat();
      return this;
    }
    update(values: Row) {
      this.op = "update";
      this.values = [values];
      return this;
    }
    upsert(row: Row, options: { onConflict: string }) {
      this.op = "upsert";
      this.values = [row];
      this.conflict = options.onConflict.split(",");
      return this;
    }
    delete() {
      this.op = "delete";
      return this;
    }
    private run(): Row[] {
      const rows = tables[this.table];
      const matching = () => rows.filter(r => this.filters.every(f => f(r)));
      switch (this.op) {
        case "select":
          return matching();
        case "insert": {
          const inserted = this.values.map(v => ({
            id: crypto.randomUUID(),
            ...v,
          }));
          rows.push(...inserted);
          return inserted;
        }
        case "update":
          return matching().map(r => Object.assign(r, this.values[0]));
        case "upsert": {
          const v = this.values[0];
          const found = rows.find(r => this.conflict.every(c => r[c] === v[c]));
          if (found) return [Object.assign(found, v)];
          rows.push({ ...v });
          return [v];
        }
        case "delete": {
          const gone = matching();
          tables[this.table] = rows.filter(r => !gone.includes(r));
          return gone;
        }
      }
    }
    then(resolve: (r: { data: unknown; error: null }) => void) {
      const data = this.run().map(r => ({ ...r }));
      resolve({
        data: this.mode === "many" ? data : (data[0] ?? null),
        error: null,
      });
    }
  }
  return {
    db: { from: (t: string) => new Query(t) } as unknown as SupabaseClient,
    tables,
  };
}

const pool = socialPools(1).find(p =>
  socialPoolTeams(p.id).some(t => t.ref === "Ankou (Rennes)")
)!;
const EVENT = "CM|Q - J1|2026-10-17";
const match = poolMatch({
  poolId: pool.id,
  eventKey: EVENT,
  teamA: "Mariners (Vannes)",
  teamB: "Ankou (Rennes)",
})!;

function setup(socialMatches: Row[] = []) {
  return memoryDb({
    plateaux: [
      {
        id: "p1",
        event_key: EVENT,
        pool_id: pool.id,
        date: "2026-10-17",
        venue: "Rennes",
        host_club: null,
      },
    ],
    match_sheets: [
      {
        id: "s1",
        plateau_id: "p1",
        match_key: match.row.match_key,
        team_home: match.row.team_home,
        team_away: match.row.team_away,
        score_home: null,
        score_away: null,
        forfeit: null,
        status: "draft",
        version: 1,
        signed_at: null,
      },
    ],
    sheet_signatures: [],
    injuries: [],
    audit_log: [],
    social_matches: socialMatches,
  });
}

const signature = (side: "home" | "away", role: "coach" | "captain") => ({
  side,
  role,
  signerName: `${side} ${role}`,
  path: "M1 1L5 5",
});

async function signAll(db: SupabaseClient) {
  let last = false;
  for (const [side, role] of REQUIRED_SIGNATURES) {
    last = await saveSignature(
      db,
      (await loadSheet(db, "s1"))!,
      signature(side, role),
      "u1"
    );
  }
  return last;
}

const onSite = (tables: Record<string, Row[]>) =>
  publishedRows(tables.social_matches as unknown as SocialMatchRow[]);

describe("feuilles en base", () => {
  it("publie le score à la quatrième signature", async () => {
    const { db, tables } = setup();
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 30, away: 12 },
      "u1"
    );
    expect(await signAll(db)).toBe(true);

    expect(tables.match_sheets[0]).toMatchObject({
      status: "signed",
      score_home: 30,
    });
    expect(tables.social_matches).toEqual([
      expect.objectContaining({
        match_key: match.row.match_key,
        source: "delegate",
        review: "approved",
        review_score_home: 30,
        review_score_away: 12,
      }),
    ]);
    expect(tables.audit_log.map(a => a.action)).toContain("sheet.signed");
  });

  it("garde les sources Instagram d'un match déjà relevé", async () => {
    const { db, tables } = setup([
      {
        ...match.row,
        score_home: 28,
        score_away: 12,
        status: "single_source",
        auto_apply: true,
        review: null,
        accounts: ["ankou"],
        observation_ids: ["post#0"],
      },
    ]);
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 30, away: 12 },
      "u1"
    );
    await signAll(db);
    expect(tables.social_matches).toHaveLength(1);
    expect(tables.social_matches[0]).toMatchObject({
      accounts: ["ankou"],
      observation_ids: ["post#0"],
      score_home: 28,
      review: "approved",
      review_score_home: 30,
      source: "delegate",
    });
  });

  it("efface les signatures quand le score change, et refuse d'écrire sur une version dépassée", async () => {
    const { db, tables } = setup();
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 1, away: 0 },
      "u1"
    );
    const stale = (await loadSheet(db, "s1"))!;
    await saveSignature(db, stale, signature("home", "coach"), "u1");
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 2, away: 0 },
      "u1"
    );

    expect((await loadSheet(db, "s1"))!.sheet.signatures).toEqual([]);
    await expect(
      saveResult(db, stale, { kind: "score", home: 3, away: 0 }, "u1")
    ).rejects.toBeInstanceOf(SheetError);
    expect(tables.match_sheets[0]).toMatchObject({ score_home: 2 });
  });

  it("rouvre une feuille signée et retire le score du site", async () => {
    const { db, tables } = setup();
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "forfeit", side: "away" },
      "u1"
    );
    await signAll(db);
    expect(tables.social_matches[0]).toMatchObject({
      forfeit: "away",
      review: "approved",
    });

    await reopenSheet(db, (await loadSheet(db, "s1"))!, "admin1");
    const reopened = (await loadSheet(db, "s1"))!;
    expect(reopened.sheet).toMatchObject({
      status: "draft",
      signatures: [],
      result: { kind: "forfeit", side: "away" },
    });
    expect(onSite(tables)).toEqual([]);
  });

  it("cache le score Instagram d'une feuille rouverte jusqu'à la nouvelle signature", async () => {
    const { db, tables } = setup([
      {
        ...match.row,
        score_home: 28,
        score_away: 12,
        status: "single_source",
        auto_apply: true,
        review: null,
        accounts: ["ankou"],
        observation_ids: ["post#0"],
      },
    ]);
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 30, away: 12 },
      "u1"
    );
    await signAll(db);
    await reopenSheet(db, (await loadSheet(db, "s1"))!, "admin1");
    expect(onSite(tables)).toEqual([]);

    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 31, away: 12 },
      "u1"
    );
    await signAll(db);
    expect(onSite(tables)).toEqual([
      expect.objectContaining({ score_home: 31, score_away: 12 }),
    ]);
  });
});
