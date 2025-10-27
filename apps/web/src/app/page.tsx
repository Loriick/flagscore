import { Metadata } from "next";

import { ClientOnly } from "../components/ClientOnly";
import { PoolsSelector } from "../components/PoolsSelector";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata.home;

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Résultats Flag Football France - Championnat & Coupe de France
          </h1>
          <p className="text-lg text-white/80 mb-6">
            Consultez tous les résultats du championnat de France de flag
            football et de la coupe de France. Classements par poule et
            résultats des matchs.
          </p>
        </header>

        <main>
          <ClientOnly
            fallback={
              <div className="text-center py-8">
                <div className="text-white/60 text-sm">Chargement...</div>
              </div>
            }
          >
            <PoolsSelector />
          </ClientOnly>
        </main>
      </div>
    </div>
  );
}
