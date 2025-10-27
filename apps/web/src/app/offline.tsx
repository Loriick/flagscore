"use client";

export const dynamic = "force-dynamic";

export default function Offline() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        {/* Image 404 */}
        <div className="mb-8">
          <img
            src="/404.png"
            alt="Hors ligne"
            width={300}
            height={300}
            className="mx-auto"
          />
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold mb-4">Connexion requise</h1>

        {/* Description */}
        <p className="text-lg text-white/80 mb-8">
          Cette page nécessite une connexion internet pour fonctionner. Veuillez
          vérifier votre connexion et réessayer.
        </p>

        {/* Bouton de retry */}
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Réessayer
        </button>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-sm text-white/60">
          <p>
            Flagscore nécessite une connexion internet pour récupérer les
            données.
          </p>
        </div>
      </div>
    </div>
  );
}
