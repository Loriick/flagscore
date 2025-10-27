"use client";

import { AlertTriangle, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

interface TeamsErrorFallbackProps {
  error?: string;
}

export function TeamsErrorFallback({}: TeamsErrorFallbackProps) {
  const [copied, setCopied] = useState(false);

  const sqlScript = `CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pool_id INTEGER NOT NULL REFERENCES pools(id),
  championship_id INTEGER NOT NULL REFERENCES championships(id),
  season TEXT NOT NULL,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_draws INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_goals_for INTEGER DEFAULT 0,
  total_goals_against INTEGER DEFAULT 0,
  total_goal_difference INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  best_position INTEGER DEFAULT 0,
  worst_position INTEGER DEFAULT 0,
  current_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  return (
    <div className="bg-red-900 border border-red-700 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <AlertTriangle className="text-red-400 mt-1" size={24} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Table Teams Manquante
          </h3>
          <p className="text-red-300 mb-4">
            La table <code className="bg-red-800 px-2 py-1 rounded">teams</code>{" "}
            n'existe pas dans Supabase. Vous devez la créer avant de pouvoir
            rechercher des équipes.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Solution rapide :</h4>
              <ol className="text-red-300 space-y-1 text-sm">
                <li>
                  1. Aller sur{" "}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    Supabase Dashboard <ExternalLink size={14} />
                  </a>
                </li>
                <li>2. Sélectionner votre projet Flagscore</li>
                <li>3. Ouvrir "SQL Editor"</li>
                <li>4. Copier et exécuter le script ci-dessous</li>
              </ol>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Script SQL :</h4>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  <Copy size={14} />
                  {copied ? "Copié !" : "Copier"}
                </button>
              </div>
              <pre className="bg-gray-900 border border-gray-600 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                <code>{sqlScript}</code>
              </pre>
            </div>

            <div className="flex gap-3">
              <a
                href="/create-teams-table"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                Instructions détaillées
              </a>
              <a
                href="/test-teams-sync"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                Synchroniser après création
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
