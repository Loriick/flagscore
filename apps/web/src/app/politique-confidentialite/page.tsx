export const metadata = {
  title: "Politique de confidentialité | Flagscore",
  description:
    "Informations sur la collecte et l'utilisation des données sur Flagscore.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Politique de confidentialité</h1>

        <section className="space-y-4 text-white/90">
          <p>
            Flagscore respecte votre vie privée. Nous collectons un minimum de
            données nécessaires au bon fonctionnement du site.
          </p>

          <h2 className="text-xl font-semibold mt-6">Mesures d’audience</h2>
          <p>
            Nous utilisons Vercel Analytics et Vercel Speed Insights pour
            mesurer l’utilisation du site et améliorer les performances. Ces
            outils sont « cookie-less » (sans cookies) et ne stockent pas
            d’identifiants personnels.
          </p>

          <h2 className="text-xl font-semibold mt-6">Cookies</h2>
          <p>
            Aucun cookie de suivi marketing n’est utilisé. Une bannière de
            consentement n’est pas nécessaire pour ces mesures d’audience.
          </p>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>
            Pour toute question liée à la confidentialité, contactez-nous à
            l’adresse suivante : contact@flagscore.fr
          </p>
        </section>
      </div>
    </div>
  );
}


