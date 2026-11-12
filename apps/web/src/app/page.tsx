import { Metadata } from "next";

import { ClientOnly } from "../components/ClientOnly";
import { PoolsSelector } from "../components/PoolsSelector";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata.home;

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-10">
      <h1 className="font-score mb-4 text-[2rem] leading-none font-black text-chalk sm:mb-6 sm:text-5xl">
        Résultats
        <span className="sr-only">
          {" "}
          du Championnat de France mixte et de la Coupe de France de flag
          football
        </span>
      </h1>

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
