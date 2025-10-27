"use client";

import { useState } from "react";

export default function TestTeamsSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Test de Synchronisation des Équipes
        </h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Synchroniser les équipes depuis les classements
          </h2>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isSyncing ? "Synchronisation..." : "Lancer la synchronisation"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Erreur</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Succès
            </h3>
            <pre className="text-green-300 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Instructions
          </h2>
          <ol className="text-gray-300 space-y-2">
            <li>
              1. Assurez-vous que la table{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">teams</code>{" "}
              existe dans Supabase
            </li>
            <li>
              2. Vérifiez que vous avez des données dans la table{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">rankings</code>
            </li>
            <li>3. Cliquez sur "Lancer la synchronisation"</li>
            <li>4. Vérifiez les résultats dans Supabase</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
