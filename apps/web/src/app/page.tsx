import { Metadata } from "next";

import { ClientOnly } from "../components/ClientOnly";
import { PoolsSelector } from "../components/PoolsSelector";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata.home;

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="font-score text-[clamp(2.5rem,11.5vw,3.75rem)] leading-none font-black text-chalk">
          Résultats
        </h1>
        <p className="mt-2 max-w-xl text-sm text-stone sm:text-base">
          Championnat de France mixte et Coupe de France de flag football.
        </p>
      </header>

      <ClientOnly
        fallback={
          <p className="border-y border-line py-10 text-sm text-stone">
            Chargement…
          </p>
        }
      >
        <PoolsSelector />
      </ClientOnly>
    </div>
  );
}
