import { addDays } from "../social/calendar";
import { todayInParis } from "../social/schedule";

/**
 * Le délégué ne peut modifier un plateau que de la veille au surlendemain
 * (jours calendaires, heure de Paris). En dehors : lecture seule.
 */
export function editWindow(plateauDate: string) {
  return { from: addDays(plateauDate, -1), to: addDays(plateauDate, 2) };
}

export function isWithinEditWindow(plateauDate: string, now = new Date()) {
  const today = todayInParis(now);
  const { from, to } = editWindow(plateauDate);
  return today >= from && today <= to;
}
