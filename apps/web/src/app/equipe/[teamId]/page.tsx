"use client";

import {
  ArrowLeft,
  Trophy,
  Target,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useTeam } from "../../../hooks/useTeams";

export const dynamic = "force-dynamic";

export default function EquipePage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const { data: team, isLoading, error } = useTeam(teamId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de l'équipe...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            Erreur lors du chargement de l'équipe
          </p>
          <Link href="/recherche" className="text-blue-400 hover:text-blue-300">
            ← Retour à la recherche
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Retour à la recherche
          </Link>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">{team.name}</h1>
              <div className="flex items-center gap-2 text-yellow-400">
                <Trophy size={24} />
                <span className="text-xl font-bold">
                  #{team.current_position}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{team.pools?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>{team.championships?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Statistiques générales */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={20} />
              Statistiques générales
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {team.total_matches}
                </div>
                <div className="text-gray-400">Matchs joués</div>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {team.total_points}
                </div>
                <div className="text-gray-400">Points totaux</div>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {team.total_wins}
                </div>
                <div className="text-gray-400">Victoires</div>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-red-400">
                  {team.total_losses}
                </div>
                <div className="text-gray-400">Défaites</div>
              </div>
            </div>
          </div>

          {/* Statistiques offensives */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target size={20} />
              Statistiques offensives
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">Points marqués</span>
                <span className="text-xl font-bold text-white">
                  {team.total_goals_for}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">Points encaissés</span>
                <span className="text-xl font-bold text-white">
                  {team.total_goals_against}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">Différence de points</span>
                <span
                  className={`text-xl font-bold ${team.total_goal_difference > 0 ? "text-green-400" : team.total_goal_difference < 0 ? "text-red-400" : "text-gray-400"}`}
                >
                  {team.total_goal_difference > 0 ? "+" : ""}
                  {team.total_goal_difference}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                <span className="text-gray-400">Matchs nuls</span>
                <span className="text-xl font-bold text-white">
                  {team.total_draws}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Évolution du classement */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Évolution du classement
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {team.best_position}
              </div>
              <div className="text-gray-400">Meilleure position</div>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-red-400">
                {team.worst_position}
              </div>
              <div className="text-gray-400">Pire position</div>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">
                {team.current_position}
              </div>
              <div className="text-gray-400">Position actuelle</div>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Informations
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Saison:</span>
              <span className="text-white ml-2">{team.season}</span>
            </div>
            <div>
              <span className="text-gray-400">Poule:</span>
              <span className="text-white ml-2">{team.pools?.name}</span>
            </div>
            <div>
              <span className="text-gray-400">Championnat:</span>
              <span className="text-white ml-2">
                {team.championships?.name}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Pourcentage de victoires:</span>
              <span className="text-white ml-2">
                {team.total_matches > 0
                  ? Math.round((team.total_wins / team.total_matches) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
