import { describe, expect, it } from "vitest";

import { invitationEmail } from "../invitation";

const email = invitationEmail({
  email: "jo+délégué@club.fr",
  fullName: "Jo <Martin>",
  matchsUrl: "https://matchs.flagscore.fr/",
  plateau: {
    id: "p1",
    event_key: "CM|Q - J1|2026-10-17",
    pool_id: 101,
    date: "2026-10-17",
    venue: "Gymnase Colette Besson, Rennes",
    host_club: null,
  },
});

const LOGIN =
  "https://matchs.flagscore.fr/login?email=jo%2Bd%C3%A9l%C3%A9gu%C3%A9%40club.fr";

describe("email d'invitation d'un délégué", () => {
  it("renvoie vers la page de connexion, email pré-rempli, sans jeton", () => {
    expect(email.text).toContain(LOGIN);
    expect(email.html).toContain(`href="${LOGIN}"`);
    for (const body of [email.text, email.html]) {
      expect(body).not.toMatch(/token|auth\/callback/);
    }
  });

  it("explique quoi faire le jour du match", () => {
    expect(email.text).toContain("Recevoir mon lien");
    expect(email.text).toMatch(/valable 1 heure/);
  });

  it("donne le lieu, la date et les équipes du plateau", () => {
    expect(email.subject).toContain("Gymnase Colette Besson, Rennes");
    expect(email.text).toContain("samedi 17 octobre");
    expect(email.text).toMatch(/Équipes : .*Ankou/);
    expect(email.html).toContain("Jo &lt;Martin&gt;");
  });
});
