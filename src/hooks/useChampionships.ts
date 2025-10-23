import { useState, useEffect } from "react";

import { Championship } from "../app/types";
import { getChampionships } from "../lib/fffa-api";

export function useChampionships(season: number) {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChampionships = async () => {
      setLoading(true);
      setError(null);
      try {
        const championshipsData = await getChampionships(season);
        setChampionships(championshipsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des compétitions"
        );
        console.error("Erreur lors du chargement des compétitions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChampionships();
  }, [season]);

  return { championships, loading, error };
}
