import { useQueryState } from "nuqs";
import { useCallback } from "react";

/**
 * Hook pour synchroniser l'état de l'application avec l'URL pour le partage
 * Gère les paramètres: season, championship, pool, day
 * Note: view n'est plus nécessaire car day présent = résultats, sinon classement
 */
export function useShareableUrl() {
  const [season, setSeason] = useQueryState("season", {
    defaultValue: "2026",
    parse: v => v || "2026",
    serialize: v => v || "2026",
  });

  const [championship, setChampionship] = useQueryState("championship", {
    defaultValue: null,
    parse: v => (v ? parseInt(v, 10) : null),
    serialize: v => (v ? v.toString() : ""),
  });

  const [pool, setPool] = useQueryState("pool", {
    defaultValue: null,
    parse: v => (v ? parseInt(v, 10) : null),
    serialize: v => (v ? v.toString() : ""),
  });

  const [day, setDay] = useQueryState("day", {
    defaultValue: null,
    parse: v => (v ? parseInt(v, 10) : null),
    serialize: v => (v ? v.toString() : ""),
  });

  // Mettre à jour l'URL quand l'état change
  const updateUrl = useCallback(
    (updates: {
      season?: number;
      championship?: number | null;
      pool?: number | null;
      day?: number | null;
    }) => {
      if (updates.season !== undefined) {
        setSeason(updates.season.toString());
      }
      if (updates.championship !== undefined) {
        setChampionship(updates.championship);
      }
      if (updates.pool !== undefined) {
        setPool(updates.pool);
      }
      if (updates.day !== undefined) {
        setDay(updates.day);
      }
    },
    [setSeason, setChampionship, setPool, setDay]
  );

  return {
    // État depuis l'URL
    season: parseInt(season || "2026", 10),
    championship: championship || 0,
    pool: pool || 0,
    day: day || 0,

    // Setters
    setSeason: (s: number) => setSeason(s.toString()),
    setChampionship: (c: number | null) => setChampionship(c),
    setPool: (p: number | null) => setPool(p),
    setDay: (d: number | null) => setDay(d),

    // Fonction utilitaire
    updateUrl,

    // Reset
    reset: () => {
      setSeason(null);
      setChampionship(null);
      setPool(null);
      setDay(null);
    },
  };
}
