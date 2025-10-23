import { Metadata } from "next";

import { PoolsSelector } from "../components/PoolsSelector";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Consultez tous les résultats du championnat de France de flag football et de la coupe de France. Scores en temps réel, classements par poule et statistiques détaillées des équipes.",
  keywords: [
    "flag football france",
    "championnat flag football",
    "coupe france flag football",
    "résultats flag football",
    "scores flag football",
    "classements flag football",
    "FFFA",
    "fédération française flag football",
  ],
  openGraph: {
    title: "Flagscore - Résultats Flag Football France",
    description:
      "Consultez tous les résultats du championnat de France de flag football et de la coupe de France. Scores en temps réel, classements par poule et statistiques détaillées des équipes.",
    url: "https://flagscore.fr",
    images: [
      {
        url: "/flagscore-logo-removebg-preview.png",
        width: 1200,
        height: 630,
        alt: "Flagscore - Résultats Flag Football France",
      },
    ],
  },
  twitter: {
    title: "Flagscore - Résultats Flag Football France",
    description:
      "Consultez tous les résultats du championnat de France de flag football et de la coupe de France.",
  },
  alternates: {
    canonical: "https://flagscore.fr",
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Flagscore",
    description:
      "Résultats du championnat de France de flag football et de la coupe de France",
    url: "https://flagscore.fr",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://flagscore.fr/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Flagscore",
      url: "https://flagscore.fr",
    },
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Résultats Flag Football France - Championnat & Coupe de France
          </h1>
          <p className="text-lg text-white/80 mb-6">
            Consultez tous les résultats du championnat de France de flag
            football et de la coupe de France.
          </p>
        </header>

        <main>
          <PoolsSelector />
        </main>
      </div>
    </div>
  );
}
