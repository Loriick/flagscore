import { useState, useEffect } from "react";

import { Day, Match } from "../app/types";
import { getDays, getMatches } from "../lib/fffa-api";

export function useMatches(poolId: number) {
  const [days, setDays] = useState<Day[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoolData = async () => {
      if (!poolId) {
        setDays([]);
        setMatches([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Récupérer les journées de la pool sélectionnée
        const poolDays = await getDays(poolId);
        setDays(poolDays);

        // Récupérer les matchs de la première journée
        if (poolDays.length > 0) {
          const firstDayMatches = await getMatches(poolDays[0].id);
          setMatches(firstDayMatches);
        } else {
          setMatches([]);
        }

        console.log("Données de la pool:", {
          poolId,
          days: poolDays,
          matches: poolDays.length > 0 ? await getMatches(poolDays[0].id) : [],
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des données de la pool"
        );
        console.error("Erreur lors du chargement des données de la pool:", err);
        setDays([]);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPoolData();
  }, [poolId]);

  return { days, matches, loading, error };
}
