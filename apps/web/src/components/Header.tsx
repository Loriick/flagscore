"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Résultats" },
  { href: "/classements", label: "Classements" },
  { href: "/recherche", label: "Recherche" },
  { href: "/a-propos", label: "À propos" },
];

const DEV_LINKS = [
  { href: "/monitoring", label: "Monitoring" },
  { href: "/logs-monitor", label: "Logs" },
  { href: "/test-teams-sync", label: "Test Teams" },
  { href: "/create-teams-table", label: "Create Table" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Referme le menu mobile à chaque navigation.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const links =
    process.env.NODE_ENV === "development"
      ? [...NAV_LINKS, ...DEV_LINKS]
      : NAV_LINKS;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-30 w-full bg-flag text-ink">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="-ml-1 flex items-center rounded-sm focus-visible:outline-ink"
          aria-label="Flagscore, accueil"
        >
          {/* Logo d'origine recadré sur son dessin (public/flagscore-logo.png),
              sans aucune autre modification. */}
          <Image
            src="/flagscore-logo.png"
            alt="Flagscore"
            width={410}
            height={281}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <nav
          className="hidden items-stretch self-stretch md:flex"
          aria-label="Navigation principale"
        >
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative flex items-center px-3 text-sm font-semibold tracking-wide transition-colors focus-visible:outline-ink focus-visible:-outline-offset-4 ${
                isActive(link.href)
                  ? "text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-ink"
                  : "text-ink/75 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="-mr-2 flex size-11 items-center justify-center rounded-sm text-ink transition-colors hover:bg-ink/10 focus-visible:outline-ink md:hidden"
          onClick={() => setIsMobileMenuOpen(open => !open)}
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-controls="mobile-menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="size-6" strokeWidth={2.25} aria-hidden="true" />
          ) : (
            <Menu className="size-6" strokeWidth={2.25} aria-hidden="true" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav
          id="mobile-menu"
          className="fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto bg-ink md:hidden"
          aria-label="Navigation mobile"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {links.map(link => (
              <li
                key={link.href}
                className="border-b border-line last:border-b-0"
              >
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`font-score flex min-h-12 items-center text-2xl font-bold ${
                    isActive(link.href)
                      ? "text-flag"
                      : "text-chalk hover:text-flag"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
