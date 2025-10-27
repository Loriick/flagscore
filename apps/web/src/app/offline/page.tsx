import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center p-4">
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
        <h1 className="text-3xl font-bold mb-4">Vous êtes hors ligne</h1>

        {/* Description */}
        <p className="text-lg text-white/80 mb-8">
          Il semble que vous n'ayez pas de connexion internet. Vérifiez votre
          connexion et réessayez.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Réessayer
          </button>

          <Link
            href="/"
            className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </Link>

          {process.env.NODE_ENV === "development" && (
            <Link
              href="/offline"
              className="block w-full bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Page offline (test)
            </Link>
          )}
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-sm text-white/60">
          <p>Flagscore fonctionne mieux avec une connexion internet active.</p>
          <p className="mt-2">
            Les données sont mises à jour en temps réel depuis l'API FFFA.
          </p>
        </div>
      </div>
    </div>
  );
}
