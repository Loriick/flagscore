import { Metadata } from "next";

import { ContactForm } from "../../components/ContactForm";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata.about;

const COMPETITIONS = [
  {
    name: "Championnat de France mixte",
    text: "Qualifications par plateaux à l'automne, journées de championnat de février à mars, puis demi-finales et finales au printemps.",
  },
  {
    name: "Coupe de France",
    text: "Deux tableaux, masculin et féminin, avec leurs propres poules de qualification, puis des phases finales de conférence et une finale nationale.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-score text-[clamp(2.5rem,11.5vw,3.75rem)] leading-none font-black text-chalk">
          À propos
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-chalk">
          Flagscore réunit les scores et les classements des compétitions
          nationales de flag football en France, pour les retrouver en quelques
          secondes sur son téléphone, dès le lendemain d&apos;une journée.
        </p>
      </header>

      <div className="grid gap-12 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-16">
        <div className="space-y-10">
          <section aria-labelledby="competitions">
            <h2
              id="competitions"
              className="font-score mb-4 text-3xl leading-none font-black"
            >
              Les compétitions
            </h2>
            <ul className="border-t border-line">
              {COMPETITIONS.map(c => (
                <li key={c.name} className="border-b border-line py-4">
                  <h3 className="font-score text-2xl font-bold text-chalk">
                    {c.name}
                  </h3>
                  <p className="mt-1 max-w-prose text-sm leading-relaxed text-stone">
                    {c.text}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sources">
            <h2
              id="sources"
              className="font-score mb-4 text-3xl leading-none font-black"
            >
              D&apos;où viennent les scores
            </h2>
            <p className="max-w-prose leading-relaxed text-stone">
              Le calendrier, les poules et les résultats viennent de la{" "}
              <a
                href="https://www.fffa.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-chalk underline decoration-flag decoration-2 hover:text-flag"
              >
                Fédération Française de Football Américain (FFFA)
              </a>
              , qui organise le flag football en France. Flagscore n&apos;est
              pas un site de la fédération : pour les règlements et les
              décisions officielles, référez-vous à la FFFA.
            </p>
          </section>
        </div>

        <section
          id="contact"
          aria-labelledby="contact-title"
          className="self-start border-t-[3px] border-flag pt-5"
        >
          <h2
            id="contact-title"
            className="font-score mb-2 text-3xl leading-none font-black"
          >
            Une erreur de score ?
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-stone">
            Signalez-la, ou envoyez une idée pour améliorer Flagscore.
          </p>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
