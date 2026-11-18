import { describe, expect, it } from "vitest";

import { callbackRedirect } from "../env";

const callback = new URL(
  "https://matchs.flagscore.fr/auth/callback?code=abc&next=x"
);
const target = (next: string | null, ok = true) =>
  callbackRedirect(callback, next, ok).toString();

describe("retour du lien magique", () => {
  it("garde le chemin et la requête de next", () => {
    expect(target("/scores?view=reviewed&x=1")).toBe(
      "https://matchs.flagscore.fr/scores?view=reviewed&x=1"
    );
  });

  it("ne quitte jamais le domaine", () => {
    for (const next of [
      "//evil.com/x",
      "/\\evil.com",
      "https://evil.com",
      null,
    ]) {
      expect(target(next)).toBe("https://matchs.flagscore.fr/");
    }
  });

  it("renvoie vers /login quand le lien est refusé", () => {
    expect(target("/scores", false)).toBe(
      "https://matchs.flagscore.fr/login?error=lien"
    );
  });
});
