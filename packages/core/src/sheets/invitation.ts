import {
  describePlateau,
  formatDay,
  MATCHS_APP_NAME,
  teamLabel,
} from "./labels";
import type { PlateauRow } from "./store";

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!
  );

/**
 * Email d'invitation d'un délégué. Il ne contient aucun lien de connexion :
 * un lien magique expire au bout d'une heure, et l'invitation part souvent
 * des jours avant le plateau. Le bouton ouvre la page de connexion de l'app
 * matchs, email pré-rempli ; le délégué y demande un lien frais le jour J.
 */
export function invitationEmail(input: {
  email: string;
  fullName: string;
  plateau: PlateauRow;
  matchsUrl: string;
}) {
  const { pool, stage, competition, teams } = describePlateau(input.plateau);
  const day = formatDay(input.plateau.date);
  const link = `${input.matchsUrl.replace(/\/$/, "")}/login?email=${encodeURIComponent(input.email)}`;
  const before = [
    `Bonjour ${input.fullName},`,
    `Tu es délégué de match pour le plateau du ${day} (${input.plateau.venue}).`,
    `${competition} · ${pool} · ${stage}`,
    `Équipes : ${teams.map(t => teamLabel(t.ref)).join(", ")}`,
    "Le jour J, tu saisis les scores et les blessés sur ton téléphone, puis les deux coachs et les deux capitaines signent chaque match.",
    "Le jour du match, ouvre ce lien sur ton téléphone et touche « Recevoir mon lien » : tu reçois par email ton lien de connexion, valable 1 heure.",
  ];
  const after = ["L'équipe Flagscore"];
  const linkLabel = `Ouvrir Flagscore ${MATCHS_APP_NAME}`;
  return {
    subject: `Délégué de match · ${day} · ${input.plateau.venue}`,
    text: [...before, `${linkLabel} : ${link}`, ...after].join("\n\n"),
    html: [
      ...before.map(p => `<p>${escape(p)}</p>`),
      `<p><a href="${escape(link)}">${escape(linkLabel)}</a></p>`,
      ...after.map(p => `<p>${escape(p)}</p>`),
    ].join("\n"),
  };
}
