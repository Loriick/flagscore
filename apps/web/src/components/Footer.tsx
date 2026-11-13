import Link from "next/link";

const LINKS = [
  { href: "/", label: "Résultats" },
  { href: "/classements", label: "Classements" },
  { href: "/recherche", label: "Recherche" },
  { href: "/a-propos", label: "À propos" },
];

const LEGAL = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-confidentialite", label: "Confidentialité" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-ink text-stone">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-score text-3xl font-black text-chalk">Flagscore</p>
          <p className="max-w-sm text-sm leading-relaxed">
            Les scores et les classements du Championnat de France de flag
            football et de la Coupe de France, au plus près des journées.
          </p>
        </div>

        <nav aria-label="Pied de page">
          <h2 className="font-score mb-3 text-lg font-bold text-chalk">
            Naviguer
          </h2>
          <ul className="space-y-1">
            {LINKS.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center text-sm transition-colors hover:text-chalk"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-score mb-3 text-lg font-bold text-chalk">
            Sources
          </h2>
          <p className="text-sm leading-relaxed">
            Calendrier et poules publiés par la{" "}
            <a
              href="https://www.fffa.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-chalk underline decoration-flag decoration-2 hover:text-flag"
            >
              FFFA
            </a>
            . Scores relevés sur les comptes Instagram des clubs.
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Flagscore</p>
          <ul className="flex gap-5">
            {LEGAL.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center transition-colors hover:text-chalk"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
