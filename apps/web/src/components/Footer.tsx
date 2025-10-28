import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 border-t border-gray-600">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Flagscore</h3>
            <p className="text-white/70 text-sm">
              Votre source d&apos;information pour le flag football français.
              Résultats officiels du championnat de France et de la coupe de
              France.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Navigation</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Résultats
              </Link>
              <Link
                href="/classements"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Classements
              </Link>
              <Link
                href="/a-propos"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                À propos
              </Link>
            </nav>
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Informations</h3>
            <div className="text-white/70 text-sm space-y-2">
              <p>
                Données officielles de la{" "}
                <a
                  href="https://www.fffa.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  FFFA
                </a>
              </p>
              <p>Championnat de France mixte</p>
              <p>Coupe de France</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-600 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2025 Flagscore. Tous droits réservés.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                Mentions légales
              </a>
              <Link
                href="/politique-confidentialite"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
