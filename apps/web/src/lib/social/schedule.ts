/**
 * Quand lancer la collecte des posts ?
 *
 * Seulement dans les jours qui suivent une journée de compétition du
 * calendrier : les clubs publient leurs résultats du dimanche soir au milieu
 * de semaine. Les autres jours, on ne lance rien (et on ne paie rien).
 */

import { SEASON_2026_2027, type CompetitionEvent } from "./calendar";

export interface CollectionWindow {
  /** Journées dont on attend les résultats. */
  events: CompetitionEvent[];
  /** Ne récupérer que les posts publiés depuis cette date (YYYY-MM-DD). */
  since: string;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) /
      86_400_000
  );
}

/**
 * @param today YYYY-MM-DD
 * @param maxDaysAfter Nombre de jours après la fin d'une journée pendant
 *   lesquels on collecte encore (4 : du lundi au jeudi après un week-end).
 */
export function collectionWindow(
  today: string,
  { calendar = SEASON_2026_2027, maxDaysAfter = 4 } = {}
): CollectionWindow | null {
  const events = calendar.filter(e => {
    const d = daysBetween(e.end, today);
    return d >= 1 && d <= maxDaysAfter;
  });
  if (events.length === 0) return null;
  const since = events.reduce(
    (min, e) => (e.start < min ? e.start : min),
    events[0].start
  );
  return { events, since };
}

/** Date du jour (YYYY-MM-DD) en heure de Paris. */
export function todayInParis(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
