import { describe, expect, it } from "vitest";

import {
  manualMatchRow,
  poolMatch,
  socialPools,
  socialPoolTeams,
} from "../../social/results";
import {
  applyCommand,
  emptySheet,
  injuryInput,
  isWithinEditWindow,
  missingSignatures,
  publishRow,
  REQUIRED_SIGNATURES,
  type Sheet,
  type Signature,
  signatureInput,
  signatureCount,
} from "..";

const NOW = new Date("2026-11-29T15:00:00Z");

const sign = (side: Signature["side"], role: Signature["role"]): Signature => ({
  side,
  role,
  signerName: `${side} ${role}`,
  path: "M1 1L2 2",
});

function run(sheet: Sheet, ...commands: Parameters<typeof applyCommand>[1][]) {
  let current = sheet;
  for (const command of commands) {
    const t = applyCommand(current, command, "delegate", NOW);
    if (!t.ok) throw new Error(t.error);
    current = t.sheet;
  }
  return current;
}

const scored = () =>
  run(emptySheet(), {
    type: "setResult",
    result: { kind: "score", home: 21, away: 14 },
  });

describe("feuille de match", () => {
  it("refuse une signature tant que le score n'est pas saisi", () => {
    const t = applyCommand(
      emptySheet(),
      { type: "sign", signature: sign("home", "coach") },
      "delegate",
      NOW
    );
    expect(t.ok).toBe(false);
  });

  it("passe à « signée » à la quatrième signature, pas avant", () => {
    const three = run(
      scored(),
      { type: "sign", signature: sign("home", "coach") },
      { type: "sign", signature: sign("home", "captain") },
      { type: "sign", signature: sign("away", "coach") }
    );
    expect(three.status).toBe("draft");
    expect(signatureCount(three)).toBe(3);
    expect(missingSignatures(three)).toEqual([["away", "captain"]]);

    const t = applyCommand(
      three,
      { type: "sign", signature: sign("away", "captain") },
      "delegate",
      NOW
    );
    expect(t.ok && t.becameSigned).toBe(true);
    expect(t.ok && t.sheet.status).toBe("signed");
    expect(t.ok && t.sheet.signedAt).toBe(NOW.toISOString());
  });

  it("remplace la signature d'un même signataire au lieu de la compter deux fois", () => {
    const sheet = run(
      scored(),
      { type: "sign", signature: sign("home", "coach") },
      {
        type: "sign",
        signature: { ...sign("home", "coach"), signerName: "Autre" },
      }
    );
    expect(signatureCount(sheet)).toBe(1);
    expect(sheet.signatures[0].signerName).toBe("Autre");
  });

  it("efface les signatures quand le score change", () => {
    const signedOnce = run(scored(), {
      type: "sign",
      signature: sign("home", "coach"),
    });
    const t = applyCommand(
      signedOnce,
      { type: "setResult", result: { kind: "score", home: 21, away: 20 } },
      "delegate",
      NOW
    );
    expect(t.ok && t.signaturesCleared).toBe(true);
    expect(t.ok && t.sheet.signatures).toEqual([]);
  });

  it("verrouille une feuille signée, que seul un admin peut rouvrir", () => {
    const signed = run(
      scored(),
      ...REQUIRED_SIGNATURES.map(([side, role]) => ({
        type: "sign" as const,
        signature: sign(side, role),
      }))
    );
    expect(signed.status).toBe("signed");
    for (const command of [
      {
        type: "setResult" as const,
        result: { kind: "forfeit" as const, side: "home" as const },
      },
      { type: "sign" as const, signature: sign("home", "coach") },
      { type: "reopen" as const },
    ]) {
      expect(applyCommand(signed, command, "delegate", NOW).ok).toBe(false);
    }
    const reopened = applyCommand(signed, { type: "reopen" }, "admin", NOW);
    expect(reopened.ok && reopened.sheet).toMatchObject({
      status: "draft",
      signatures: [],
      signedAt: null,
      result: { kind: "score", home: 21, away: 14 },
    });
  });
});

describe("publication d'une feuille signée", () => {
  const pool = socialPools(1).find(p =>
    socialPoolTeams(p.id).some(t => t.ref === "Ankou (Rennes)")
  )!;
  const eventKey = "CM|Q - J1|2026-10-17";
  const plateau = { pool_id: pool.id, event_key: eventKey };

  it("retombe sur la même ligne que la saisie à la main, quel que soit l'ordre des équipes", () => {
    const match = poolMatch({
      poolId: pool.id,
      eventKey,
      teamA: "Mariners (Vannes)",
      teamB: "Ankou (Rennes)",
    })!;
    const row = publishRow(
      {
        match_key: match.row.match_key,
        team_home: match.row.team_home,
        team_away: match.row.team_away,
        score_home: 30,
        score_away: 12,
        forfeit: null,
      },
      plateau
    );
    const manual = manualMatchRow({
      poolId: pool.id,
      dayId: 20261017,
      teamA: "Mariners (Vannes)",
      teamB: "Ankou (Rennes)",
      scoreA: 12,
      scoreB: 30,
    })!;
    expect(row).toMatchObject({
      match_key: manual.match_key,
      team_home: "Ankou (Rennes)",
      score_home: 30,
      review: "approved",
      review_score_home: 30,
      review_score_away: 12,
      source: "delegate",
      reason: "Feuille signée par les deux équipes",
    });
  });

  it("publie un forfait sans inventer de score", () => {
    const match = poolMatch({
      poolId: pool.id,
      eventKey,
      teamA: "Ankou (Rennes)",
      teamB: "Mariners (Vannes)",
    })!;
    const row = publishRow(
      { ...match.row, score_home: null, score_away: null, forfeit: "away" },
      plateau
    );
    expect(row).toMatchObject({
      forfeit: "away",
      score_home: null,
      review_score_home: null,
    });
  });

  it("refuse une feuille dont les équipes ne sont pas celles de la poule du plateau", () => {
    const row = publishRow(
      {
        match_key: `${eventKey}|Ankou (Rennes)|Yankees (Angers)`,
        team_home: "Ankou (Rennes)",
        team_away: "Yankees (Angers)",
        score_home: 1,
        score_away: 0,
        forfeit: null,
      },
      plateau
    );
    expect(row).toBeNull();
  });
});

describe("fenêtre de saisie du délégué (heure de Paris)", () => {
  const date = "2026-11-29";
  it.each([
    ["2026-11-27T22:59:00Z", false], // 27/11 23h59 à Paris
    ["2026-11-27T23:00:00Z", true], // veille, 0h à Paris
    ["2026-12-01T22:59:00Z", true], // surlendemain, 23h59 à Paris
    ["2026-12-01T23:00:00Z", false], // 2 décembre à Paris
  ])("%s → %s", (now, expected) => {
    expect(isWithinEditWindow(date, new Date(now))).toBe(expected);
  });
});

describe("validation des saisies", () => {
  it("n'accepte qu'un tracé SVG, jamais du balisage", () => {
    const base = { side: "home", role: "coach", signerName: "Léa" };
    expect(
      signatureInput.safeParse({ ...base, path: "M10 10L20 25.5L30 12" })
        .success
    ).toBe(true);
    expect(
      signatureInput.safeParse({
        ...base,
        path: 'M0 0"/><script>alert(1)</script>',
      }).success
    ).toBe(false);
  });

  it("ne garde que le joueur et le moment d'un blessé", () => {
    const parsed = injuryInput.parse({
      side: "away",
      playerName: " Sam ",
      jerseyNumber: "",
      moment: "2e mi-temps",
      description: "ne doit pas être gardé",
    });
    expect(parsed).toEqual({
      side: "away",
      playerName: "Sam",
      jerseyNumber: null,
      moment: "2e mi-temps",
    });
  });
});
