import { Metadata } from "next";

import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata.about;

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">À propos de Flagscore</h1>
          <p className="text-lg text-white/80">
            Votre plateforme de référence pour le flag football français
          </p>
        </header>

        <main className="space-y-8">
          <section className="p-6 bg-white/5 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Notre Mission</h2>
            <p className="text-white/80 leading-relaxed">
              Flagscore est dédié à fournir les résultats les plus récents et
              précis du flag football français. Nous nous engageons à offrir une
              expérience utilisateur optimale pour suivre les performances des
              équipes et l&apos;évolution des compétitions.
            </p>
          </section>

          <section className="p-6 bg-white/5 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Les Compétitions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">
                  Championnat de France
                </h3>
                <p className="text-white/70">
                  Le championnat de France de flag football mixte est organisé
                  par la{" "}
                  <a
                    href="https://www.fffa.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    FFFA (Fédération Française de Flag Football)
                  </a>
                  . Découvrez les résultats de toutes les équipes participantes
                  et suivez l&apos;évolution du championnat.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">
                  Coupe de France
                </h3>
                <p className="text-white/70">
                  La coupe de France de flag football rassemble les meilleures
                  équipes du territoire français. Suivez l&apos;évolution du
                  tournoi et les performances des équipes dans cette compétition
                  prestigieuse.
                </p>
              </div>
            </div>
          </section>

          <section className="p-6 bg-white/5 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Partenariat FFFA</h2>
            <p className="text-white/80 mb-4">
              Flagscore utilise les données officielles de la{" "}
              <a
                href="https://www.fffa.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline font-medium"
              >
                Fédération Française de Flag Football (FFFA)
              </a>{" "}
              pour vous offrir les données les plus fiables et à jour.
            </p>
            <p className="text-white/70">
              La FFFA est l&apos;organisme officiel qui régit le flag football
              en France. Visitez leur site pour plus d&apos;informations sur les
              règles, les événements et l&apos;organisation du sport.
            </p>
          </section>

          <section className="p-6 bg-white/5 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-white/80">
              Pour toute question ou suggestion concernant Flagscore,
              n&apos;hésitez pas à nous contacter. Nous sommes toujours à
              l&apos;écoute pour améliorer votre expérience.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
