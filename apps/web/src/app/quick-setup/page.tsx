"use client";

import { useState } from "react";

export default function QuickSetupPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [teamsCount, setTeamsCount] = useState<number | null>(null);

  const syncAll = async () => {
    setLoading(true);
    setStatus("Synchronisation en cours...");

    try {
      // 1. Sync championships
      setStatus("1/3: Synchronisation des championnats...");
      const champRes = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "championships", season: 2026 }),
      });
      const champData = await champRes.json();
      console.log("Championships:", champData);

      // 2. Sync complete data (pools, days, matches, rankings)
      if (champData.data && champData.data.length > 0) {
        const championshipId = champData.data[0].id;
        setStatus(
          `2/3: Synchronisation complète pour le championnat ${championshipId}...`
        );

        const completeRes = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "complete", championshipId }),
        });
        const completeData = await completeRes.json();
        console.log("Complete sync:", completeData);
      }

      // 3. Sync teams
      setStatus("3/3: Synchronisation des équipes...");
      const teamsRes = await fetch("/api/teams", {
        method: "POST",
      });
      const teamsData = await teamsRes.json();
      console.log("Teams:", teamsData);

      if (teamsData.success) {
        setTeamsCount(teamsData.data?.length || 0);
        setStatus(
          `✅ Synchronisation terminée ! ${teamsCount || teamsData.data?.length || 0} équipes synchronisées.`
        );
      } else {
        setStatus(
          `⚠️ Erreur lors de la synchronisation des équipes: ${teamsData.error}`
        );
      }
    } catch (error) {
      setStatus(
        `❌ Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const checkTeams = async () => {
    const res = await fetch("/api/teams");
    const data = await res.json();
    if (data.success) {
      setTeamsCount(data.data?.length || 0);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Configuration Rapide - Recherche d'Équipes
        </h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Configuration complète en un clic
          </h2>

          <p className="text-gray-300 mb-6">
            Cette page va synchroniser automatiquement :
          </p>

          <ol className="text-gray-300 space-y-2 mb-6">
            <li>1️⃣ Championnats 2026</li>
            <li>2️⃣ Poules, journées, matchs et classements</li>
            <li>3️⃣ Équipes (pour la recherche)</li>
          </ol>

          <button
            onClick={syncAll}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-lg font-semibold"
          >
            {loading
              ? "Synchronisation en cours..."
              : "🚀 Lancer la synchronisation complète"}
          </button>
        </div>

        {status && (
          <div
            className={`border rounded-lg p-6 mb-8 ${
              status.includes("✅")
                ? "bg-green-900 border-green-700"
                : status.includes("⚠️") || status.includes("❌")
                  ? "bg-red-900 border-red-700"
                  : "bg-gray-800 border-gray-700"
            }`}
          >
            <p
              className={`font-medium ${
                status.includes("✅")
                  ? "text-green-300"
                  : status.includes("⚠️") || status.includes("❌")
                    ? "text-red-300"
                    : "text-gray-300"
              }`}
            >
              {status}
            </p>
          </div>
        )}

        {teamsCount !== null && teamsCount > 0 && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-green-400 mb-2">
              ✅ Prêt pour la recherche !
            </h3>
            <p className="text-green-300">
              {teamsCount} équipes sont disponibles pour la recherche.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="/recherche"
                className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-center"
              >
                🔍 Essayer la recherche
              </a>
              <a
                href="/"
                className="block w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-center"
              >
                🏠 Retour à l'accueil
              </a>
            </div>
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">État actuel</h3>
          <button
            onClick={checkTeams}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Vérifier le nombre d'équipes
          </button>
          {teamsCount !== null && (
            <p className="mt-4 text-gray-300">
              Équipes synchronisées :{" "}
              <strong className="text-white">{teamsCount}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
