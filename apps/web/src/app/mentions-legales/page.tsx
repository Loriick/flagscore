export const metadata = {
  title: "Mentions légales | Flagscore",
  description: "Informations légales de Flagscore.",
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>

        <section className="space-y-4 text-white/90">
          <p>
            Le site Flagscore est édité par l'équipe Flagscore. Pour toute
            demande, contactez: contact@flagscore.fr
          </p>

          <h2 className="text-xl font-semibold mt-6">Hébergement</h2>
          <p>
            Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
            Covina, CA 91723, USA.
          </p>

          <h2 className="text-xl font-semibold mt-6">Propriété intellectuelle</h2>
          <p>
            Les contenus (textes, visuels) sont la propriété de leurs auteurs
            respectifs. Toute reproduction non autorisée est interdite.
          </p>

          <h2 className="text-xl font-semibold mt-6">Données personnelles</h2>
          <p>
            Consultez notre <a href="/politique-confidentialite" className="text-blue-400 hover:text-blue-300 underline">Politique de confidentialité</a> pour en savoir plus sur le
            traitement des données et les mesures d’audience sans cookies.
          </p>
        </section>
      </div>
    </div>
  );
}


