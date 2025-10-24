"use client";

import Image from "next/image";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md mx-auto text-center">
            <Image
              src="/404.png"
              alt="Erreur serveur"
              className="w-32 h-32 mx-auto mb-6 opacity-60"
              width={128}
              height={128}
            />
            <h1 className="text-4xl font-bold mb-4">500</h1>
            <h2 className="text-2xl font-semibold mb-4">Erreur serveur</h2>
            <p className="text-white/80 mb-8">
              Une erreur interne s'est produite. Notre équipe a été notifiée et
              travaille à résoudre le problème.
            </p>
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Réessayer
              </button>
              <Link
                href="/"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-white/60 mb-2">
                  Détails de l'erreur (développement)
                </summary>
                <pre className="text-xs text-red-400 bg-red-900/20 p-3 rounded overflow-auto">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
