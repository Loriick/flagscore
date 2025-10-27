"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useTeams } from "../hooks/useTeams";

import { TeamsErrorFallback } from "./TeamsErrorFallback";

interface SearchTeamsProps {
  onClose?: () => void;
  isOpen?: boolean;
  searchTerm?: string;
}

export function SearchTeams({
  onClose,
  isOpen = false,
  searchTerm: externalSearchTerm = "",
}: SearchTeamsProps) {
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Mettre à jour searchTerm quand externalSearchTerm change
  useEffect(() => {
    setSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  const {
    data: teams,
    isLoading,
    error,
  } = useTeams({
    searchTerm: searchTerm.length >= 2 ? searchTerm : undefined,
    enabled: searchTerm.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchTerm.trim())}`);
      onClose?.();
    }
  };

  const handleTeamClick = (teamId: string) => {
    router.push(`/equipe/${teamId}`);
    onClose?.();
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsSearching(false);
  };

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${isOpen ? "block" : "hidden"}`}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-lg mx-4 mt-20 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Rechercher une équipe
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="p-4">
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
              className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </form>

        {/* Results */}
        {isSearching && (
          <div className="max-h-64 overflow-y-auto border-t border-gray-700">
            {error ? (
              <div className="p-4">
                <TeamsErrorFallback error={error.message} />
              </div>
            ) : isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Recherche en cours...
              </div>
            ) : teams && teams.length > 0 ? (
              <div className="p-2">
                {teams.slice(0, 5).map(team => (
                  <button
                    key={team.id}
                    onClick={() => handleTeamClick(team.id)}
                    className="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="text-white font-medium">{team.name}</div>
                    <div className="text-sm text-gray-400">
                      {team.pools?.name} • {team.championships?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {team.total_matches} matchs • {team.total_points} pts •
                      Position {team.current_position}
                    </div>
                  </button>
                ))}
                {teams.length > 5 && (
                  <div className="p-3 text-center text-gray-400 text-sm">
                    ... et {teams.length - 5} autres équipes
                  </div>
                )}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="p-4 text-center text-gray-400">
                Aucune équipe trouvée pour "{searchTerm}"
              </div>
            ) : null}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => router.push("/recherche")}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Voir tous les résultats
          </button>
        </div>
      </div>
    </div>
  );
}
