import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <Image
          src="/404.png"
          alt="Page non trouvée"
          className="w-32 h-32 mx-auto mb-6 opacity-60"
          width={128}
          height={128}
        />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page non trouvée</h2>
        <p className="text-white/80 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/classements"
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Voir les classements
          </Link>
        </div>
      </div>
    </div>
  );
}
