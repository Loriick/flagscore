"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CreateTeamsTablePage() {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- Création de la table teams
CREATE TABLE IF NOT EXISTS teams (
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
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_pool_id ON teams(pool_id);
CREATE INDEX IF NOT EXISTS idx_teams_championship_id ON teams(championship_id);
CREATE INDEX IF NOT EXISTS idx_teams_season ON teams(season);

-- Index composite pour la recherche
CREATE INDEX IF NOT EXISTS idx_teams_search ON teams(name, pool_id, championship_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at 
  BEFORE UPDATE ON teams 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();`;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Créer la Table Teams dans Supabase
        </h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Instructions
          </h2>

          <ol className="text-gray-300 space-y-3">
            <li>
              <strong className="text-white">
                1. Ouvrir Supabase Dashboard
              </strong>
              <br />
              <span className="text-gray-400">
                Aller sur https://supabase.com/dashboard et sélectionner votre
                projet
              </span>
            </li>
            <li>
              <strong className="text-white">2. Ouvrir l'éditeur SQL</strong>
              <br />
              <span className="text-gray-400">
                Cliquer sur "SQL Editor" dans le menu de gauche
              </span>
            </li>
            <li>
              <strong className="text-white">
                3. Copier et exécuter le script
              </strong>
              <br />
              <span className="text-gray-400">
                Copier le script SQL ci-dessous et l'exécuter
              </span>
            </li>
            <li>
              <strong className="text-white">4. Vérifier la création</strong>
              <br />
              <span className="text-gray-400">
                Aller dans "Table Editor" pour voir la nouvelle table "teams"
              </span>
            </li>
          </ol>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Script SQL à exécuter
            </h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>

          <pre className="bg-gray-900 border border-gray-600 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
            <code>{sqlScript}</code>
          </pre>
        </div>

        <div className="bg-blue-900 border border-blue-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">
            ⚠️ Important
          </h2>
          <ul className="text-blue-300 space-y-2">
            <li>
              • Assurez-vous que les tables{" "}
              <code className="bg-blue-800 px-2 py-1 rounded">pools</code> et{" "}
              <code className="bg-blue-800 px-2 py-1 rounded">
                championships
              </code>{" "}
              existent déjà
            </li>
            <li>
              • Le script est sécurisé et ne supprimera pas de données
              existantes
            </li>
            <li>
              • Après création, vous pourrez synchroniser les équipes via{" "}
              <code className="bg-blue-800 px-2 py-1 rounded">
                /test-teams-sync
              </code>
            </li>
          </ul>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Prochaines étapes
          </h2>
          <ol className="text-gray-300 space-y-2">
            <li>1. Exécuter le script SQL dans Supabase</li>
            <li>
              2. Aller sur{" "}
              <a
                href="/test-teams-sync"
                className="text-blue-400 hover:text-blue-300"
              >
                /test-teams-sync
              </a>{" "}
              pour synchroniser les équipes
            </li>
            <li>3. Tester la recherche via l'icône 🔍 dans le header</li>
            <li>
              4. Explorer les pages{" "}
              <a
                href="/recherche"
                className="text-blue-400 hover:text-blue-300"
              >
                /recherche
              </a>{" "}
              et détails d'équipes
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
