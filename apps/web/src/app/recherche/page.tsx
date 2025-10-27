"use client";

import { Search, Users, Trophy, Target } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

import { TeamsErrorFallback } from "../../components/TeamsErrorFallback";
import { useTeams } from "../../hooks/useTeams";

export const dynamic = "force-dynamic";

function RechercheContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const {
    data: teams,
    isLoading,
    error,
  } = useTeams({
    searchTerm:
      debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
  });

  // Debounce la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initialiser avec le paramètre URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchTerm(q);
      setDebouncedSearchTerm(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearchTerm(searchTerm);
  };

  const handleTeamClick = (teamId: string) => {
    window.location.href = `/equipe/${teamId}`;
  };

  return (
    <>
      {/* Header de recherche */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Rechercher une équipe
        </h1>

        <form onSubmit={handleSearch} className="max-w-md">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Nom de l'équipe..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>
      </div>

      {/* Résultats */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Recherche en cours...</p>
        </div>
      ) : error ? (
        <div className="py-8">
          <TeamsErrorFallback error={error.message} />
        </div>
      ) : teams && teams.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400 mb-6">
            <Users size={20} />
            <span>
              {teams.length} équipe{teams.length > 1 ? "s" : ""} trouvée
              {teams.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map(team => (
              <div
                key={team.id}
                onClick={() => handleTeamClick(team.id)}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 hover:border-gray-600 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Trophy size={16} />
                    <span className="text-sm font-medium">
                      {team.current_position}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{team.pools?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{team.championships?.name}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {team.total_matches}
                      </div>
                      <div className="text-gray-400">Matchs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {team.total_points}
                      </div>
                      <div className="text-gray-400">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {team.total_wins}
                      </div>
                      <div className="text-gray-400">Victoires</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {team.total_goals_for}
                      </div>
                      <div className="text-gray-400">Touchdowns</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Meilleure position: {team.best_position}</span>
                  <span>
                    Différence: {team.total_goal_difference > 0 ? "+" : ""}
                    {team.total_goal_difference}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : debouncedSearchTerm.length >= 2 ? (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Aucune équipe trouvée
          </h3>
          <p className="text-gray-500">
            Aucune équipe ne correspond à "{debouncedSearchTerm}"
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Recherchez une équipe
          </h3>
          <p className="text-gray-500">
            Tapez au moins 2 caractères pour commencer la recherche
          </p>
        </div>
      )}
    </>
  );
}

export default function RecherchePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement...</p>
            </div>
          }
        >
          <RechercheContent />
        </Suspense>
      </div>
    </div>
  );
}
