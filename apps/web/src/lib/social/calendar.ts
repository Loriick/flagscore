/**
 * Calendrier prévisionnel des compétitions (source : Calendrier_Previsionnel_Competitions_2026-2027.xlsx).
 *
 * Il ne contient pas les affiches (qui joue contre qui), seulement les week-ends
 * de compétition. Il sert à déduire la compétition et la journée d'un post à
 * partir de sa date, quand le visuel ne les indique pas.
 */

export type Competition = "CM" | "CDF";

export interface CompetitionEvent {
  competition: Competition;
  /** Libellé de la journée tel que dans le calendrier (ex. "Q - J2", "DF J1", "Finale"). */
  stage: string;
  /** Premier jour (YYYY-MM-DD). */
  start: string;
  /** Dernier jour (YYYY-MM-DD). */
  end: string;
}

const weekend = (
  saturday: string,
  competition: Competition,
  stage: string
): CompetitionEvent => ({
  competition,
  stage,
  start: saturday,
  end: addDays(saturday, 1),
});

const day = (
  date: string,
  competition: Competition,
  stage: string
): CompetitionEvent => ({ competition, stage, start: date, end: date });

export const SEASON_2026_2027: CompetitionEvent[] = [
  weekend("2026-10-17", "CM", "Q - J1"),
  day("2026-10-31", "CDF", "Qualif."),
  day("2026-11-01", "CDF", "Q - J1"),
  weekend("2026-11-07", "CM", "Q - J2"),
  weekend("2026-11-21", "CDF", "Q - J2"),
  weekend("2026-12-05", "CM", "Q - J3"),
  weekend("2027-02-06", "CDF", "DF J1"),
  weekend("2027-02-13", "CM", "J1"),
  weekend("2027-02-27", "CM", "J2"),
  weekend("2027-03-06", "CDF", "DF J2"),
  weekend("2027-03-13", "CM", "J3"),
  weekend("2027-03-27", "CDF", "DF J3"),
  weekend("2027-04-03", "CM", "1/2 finale"),
  weekend("2027-04-17", "CM", "1/2 finale"),
  weekend("2027-04-24", "CDF", "FC J1"),
  weekend("2027-05-01", "CM", "FC"),
  weekend("2027-05-08", "CDF", "FC J2"),
  weekend("2027-05-29", "CM", "Finale"),
  weekend("2027-06-19", "CDF", "Finale"),
];

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) /
      86_400_000
  );
}

/**
 * Devine la compétition à partir d'un texte libre (visuel ou légende).
 * "Championnat de France Mixte", "Flag mixte" → CM ; "Coupe de France" → CDF.
 */
export function competitionFromText(
  text: string | null | undefined
): Competition | null {
  if (!text) return null;
  const t = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (/\bcoupe\b|\bcdf\b/.test(t)) return "CDF";
  if (/championnat|\bmixte\b|\bcm\b/.test(t)) return "CM";
  return null;
}

export interface ResolveEventOptions {
  /** Date du match si elle figure sur le visuel (YYYY-MM-DD). Prioritaire. */
  matchDate?: string | null;
  /** Date de publication du post (YYYY-MM-DD). */
  postedOn: string;
  competition?: Competition | null;
  /** Nombre max de jours entre la fin de la journée et la publication. */
  maxDelayDays?: number;
  calendar?: CompetitionEvent[];
}

/**
 * Retrouve la journée de compétition dont parle un post.
 *
 * - Avec une date de match explicite : la journée qui contient cette date.
 * - Sinon : la journée la plus récente terminée au plus `maxDelayDays` jours
 *   avant la publication (les clubs publient les résultats après coup).
 *
 * Renvoie `null` si aucune journée ne correspond, ou si plusieurs compétitions
 * sont possibles et que la compétition n'est pas connue.
 */
export function resolveEvent({
  matchDate,
  postedOn,
  competition,
  maxDelayDays = 6,
  calendar = SEASON_2026_2027,
}: ResolveEventOptions): CompetitionEvent | null {
  const pool = competition
    ? calendar.filter(e => e.competition === competition)
    : calendar;

  let candidates: CompetitionEvent[];
  if (matchDate) {
    candidates = pool.filter(e => e.start <= matchDate && matchDate <= e.end);
  } else {
    candidates = pool.filter(e => {
      const delay = daysBetween(e.end, postedOn);
      // Publié pendant la journée (delay négatif mais post >= start) ou après.
      return postedOn >= e.start && delay <= maxDelayDays;
    });
    if (candidates.length > 0) {
      const latestEnd = candidates.reduce(
        (max, e) => (e.end > max ? e.end : max),
        candidates[0].end
      );
      candidates = candidates.filter(e => e.end === latestEnd);
    }
  }

  return candidates.length === 1 ? candidates[0] : null;
}
