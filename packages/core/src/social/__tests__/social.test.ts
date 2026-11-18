import { describe, expect, it } from "vitest";

import {
  competitionFromText,
  recentEventsLabel,
  resolveEvent,
  type CompetitionEvent,
} from "../calendar";
import { reconcile } from "../reconcile";
import {
  resolveObservations,
  type Observation,
  type ScheduledMatch,
} from "../resolve";
import { TeamDirectory } from "../teams";

/*
 * Données tirées de deux vrais posts Instagram (week-end du 7-8 nov. 2026,
 * Championnat de France Mixte, Qualification J2) :
 *  - @flashdelacourneuve : 6 scores pour Flash A et Flash B, sans date.
 *  - @molossesasnieres   : Red 3-0 (Nighthawks, Asgards, Lycans), sam. 7 nov.
 * Les noms "FFFA" ci-dessous sont des hypothèses pour le test.
 */

const TEAMS = [
  "Flash de La Courneuve A",
  "Flash de La Courneuve B",
  "Molosses d'Asnières Red",
  "Molosses d'Asnières Black",
  "Cougars de Saint-Ouen",
  "Dragons de Paris",
  "Diables Rouges de Villepinte",
  "Homies",
  "Soldiers",
  "Nighthawks",
  "Asgards",
  "Lycans des Mureaux",
];

const directory = new TeamDirectory({
  teams: TEAMS,
  clubAccounts: [
    {
      handle: "@flashdelacourneuve",
      teams: ["Flash de La Courneuve A", "Flash de La Courneuve B"],
    },
    {
      handle: "molossesasnieres",
      teams: ["Molosses d'Asnières Red", "Molosses d'Asnières Black"],
    },
  ],
});

const Q_J2: CompetitionEvent = {
  competition: "CM",
  stage: "Q - J2",
  start: "2026-11-07",
  end: "2026-11-08",
};

let n = 0;
const obs = (
  account: string,
  team: string,
  opponent: string,
  teamScore: number,
  opponentScore: number,
  confidence = 0.95
): Observation => ({
  id: `${account}#${n++}`,
  postId: account,
  account,
  event: Q_J2,
  team,
  opponent,
  teamScore,
  opponentScore,
  confidence,
});

const flashPost = [
  obs("flashdelacourneuve", "Flash A", "Cougars", 0, 43),
  obs("flashdelacourneuve", "Flash A", "Molosses", 0, 39),
  obs("flashdelacourneuve", "Flash A", "Dragons", 7, 42),
  obs("flashdelacourneuve", "Flash B", "Diables Rouges", 7, 48),
  obs("flashdelacourneuve", "Flash B", "Homies", 26, 21),
  obs("flashdelacourneuve", "Flash B", "Soldiers", 18, 0),
];

const molossesPost = [
  obs("molossesasnieres", "Red", "Nighthawks", 18, 0),
  obs("molossesasnieres", "Red", "Asgards", 18, 0),
  obs("molossesasnieres", "Red", "Lycans", 40, 25),
];

describe("calendar", () => {
  it("retrouve la journée à partir de la date de publication", () => {
    // Post Flash publié le lundi 9 nov., sans date sur le visuel.
    expect(resolveEvent({ postedOn: "2026-11-09" })).toMatchObject({
      competition: "CM",
      stage: "Q - J2",
    });
  });

  it("privilégie la date affichée sur le visuel", () => {
    expect(
      resolveEvent({ postedOn: "2026-11-25", matchDate: "2026-11-07" })
    ).toMatchObject({ stage: "Q - J2", competition: "CM" });
  });

  it("ne rattache pas un post trop tardif", () => {
    expect(resolveEvent({ postedOn: "2026-11-30" })).toBeNull();
  });

  it("devine la compétition depuis le texte", () => {
    expect(competitionFromText("CHAMPIONNAT DE FRANCE MIXTE")).toBe("CM");
    expect(competitionFromText("Résultats / Flag Mixte / Qualification")).toBe(
      "CM"
    );
    expect(competitionFromText("Coupe de France")).toBe("CDF");
  });
});

describe("TeamDirectory", () => {
  it("restreint au club qui publie", () => {
    expect(directory.candidates("Red", "molossesasnieres")).toEqual([
      "Molosses d'Asnières Red",
    ]);
    expect(directory.candidates("Flash A", "flashdelacourneuve")).toEqual([
      "Flash de La Courneuve A",
    ]);
  });

  it("garde plusieurs candidates pour un nom ambigu", () => {
    expect(directory.candidates("Molosses").sort()).toEqual([
      "Molosses d'Asnières Black",
      "Molosses d'Asnières Red",
    ]);
  });

  it("ignore casse, accents et mots vides", () => {
    expect(directory.candidates("LYCANS")).toEqual(["Lycans des Mureaux"]);
    expect(directory.candidates("diables rouges")).toEqual([
      "Diables Rouges de Villepinte",
    ]);
  });

  it("utilise les alias", () => {
    const d = new TeamDirectory({
      teams: TEAMS,
      aliases: [{ alias: "Les Dogs", team: "Molosses d'Asnières Black" }],
    });
    expect(d.candidates("les dogs")).toEqual(["Molosses d'Asnières Black"]);
  });
});

describe("rapprochement sans calendrier (règle du plateau)", () => {
  it("déduit que le « Molosses » de Flash A n'est pas Red", () => {
    // Le post Flash est traité en premier : « Molosses » est d'abord ambigu.
    const resolved = resolveObservations(
      [...flashPost, ...molossesPost],
      directory
    );
    const flashVsMolosses = resolved.find(
      r => r.observation.opponent === "Molosses"
    )!;
    expect(flashVsMolosses.status).toBe("resolved");
    expect([flashVsMolosses.home, flashVsMolosses.away].sort()).toEqual([
      "Flash de La Courneuve A",
      "Molosses d'Asnières Black",
    ]);
  });

  it("reste ambigu tant qu'aucune information ne permet de trancher", () => {
    const resolved = resolveObservations(flashPost, directory);
    const r = resolved.find(x => x.observation.opponent === "Molosses")!;
    expect(r.status).toBe("ambiguous");
    expect(r.options).toHaveLength(2);
  });

  it("donne la même clé de match quel que soit le club qui publie", () => {
    const fromFlash = obs("flashdelacourneuve", "Flash A", "Cougars", 0, 43);
    const fromCougars = obs("cougars", "Cougars", "Flash A", 43, 0);
    const [a, b] = resolveObservations([fromFlash, fromCougars], directory);
    expect(a.matchKey).toBe(b.matchKey);
    expect([a.scoreHome, a.scoreAway]).toEqual([b.scoreHome, b.scoreAway]);
  });
});

describe("rapprochement avec calendrier", () => {
  const schedule: ScheduledMatch[] = [
    {
      id: "501_FlashA_MolBlack",
      team_home: "Molosses d'Asnières Black",
      team_away: "Flash de La Courneuve A",
      match_date: "2026-11-07",
      score_home: null,
      score_away: null,
    },
    {
      id: "502_Red_Lycans",
      team_home: "Lycans des Mureaux",
      team_away: "Molosses d'Asnières Red",
      match_date: "2026-11-07",
      score_home: null,
      score_away: null,
    },
  ];

  it("utilise le match prévu, son id et son orientation domicile/extérieur", () => {
    const [r] = resolveObservations(
      [obs("flashdelacourneuve", "Flash A", "Molosses", 0, 39)],
      directory,
      { schedule }
    );
    expect(r).toMatchObject({
      status: "resolved",
      matchId: "501_FlashA_MolBlack",
      home: "Molosses d'Asnières Black",
      scoreHome: 39,
      scoreAway: 0,
    });
  });

  it("marque « unmatched » un match absent du calendrier", () => {
    const [r] = resolveObservations(
      [obs("flashdelacourneuve", "Flash B", "Homies", 26, 21)],
      directory,
      { schedule }
    );
    expect(r.status).toBe("unmatched");
  });
});

describe("reconcile", () => {
  it("confirme un score publié par deux clubs", () => {
    const resolved = resolveObservations(
      [
        obs("flashdelacourneuve", "Flash A", "Cougars", 0, 43, 0.6),
        obs("cougars", "Cougars", "Flash A", 43, 0, 0.6),
      ],
      directory
    );
    const [d] = reconcile(resolved);
    expect(d.status).toBe("confirmed");
    expect(d.autoApply).toBe(true);
    expect(d.accounts).toHaveLength(2);
  });

  it("signale un conflit quand les clubs ne sont pas d'accord", () => {
    const resolved = resolveObservations(
      [
        obs("flashdelacourneuve", "Flash A", "Cougars", 0, 43),
        obs("cougars", "Cougars", "Flash A", 42, 0),
      ],
      directory
    );
    const [d] = reconcile(resolved);
    expect(d.status).toBe("conflict");
    expect(d.autoApply).toBe(false);
  });

  it("met en attente une source unique peu sûre", () => {
    const resolved = resolveObservations(
      [obs("flashdelacourneuve", "Flash B", "Homies", 26, 21, 0.5)],
      directory
    );
    const [d] = reconcile(resolved);
    expect(d.status).toBe("single_source");
    expect(d.autoApply).toBe(false);
  });

  it("n'écrase jamais un score FFFA", () => {
    const schedule: ScheduledMatch[] = [
      {
        id: "m1",
        team_home: "Flash de La Courneuve B",
        team_away: "Homies",
        match_date: "2026-11-07",
        score_home: 20,
        score_away: 21,
        score_source: "fffa",
      },
    ];
    const resolved = resolveObservations(
      [obs("flashdelacourneuve", "Flash B", "Homies", 26, 21)],
      directory,
      { schedule }
    );
    const [d] = reconcile(resolved, { schedule });
    expect(d.status).toBe("conflict");
    expect(d.autoApply).toBe(false);
  });

  it("traite les deux posts réels de bout en bout", () => {
    const resolved = resolveObservations(
      [...flashPost, ...molossesPost],
      directory
    );
    expect(resolved.every(r => r.status === "resolved")).toBe(true);
    const decisions = reconcile(resolved);
    expect(decisions).toHaveLength(9);
    expect(decisions.every(d => d.autoApply)).toBe(true);
  });
});

describe("recentEventsLabel", () => {
  it("décrit la journée qui vient d'avoir lieu", () => {
    expect(recentEventsLabel("2026-11-09")).toBe(
      "Championnat de France mixte, Q - J2 (2026-11-07 au 2026-11-08)"
    );
    expect(recentEventsLabel("2026-12-20")).toBeNull();
  });
});
