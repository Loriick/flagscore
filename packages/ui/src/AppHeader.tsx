"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "./styles";

/**
 * Bandeau jaune des apps matchs et admin : même logo que le site public,
 * suivi du nom de l'app pour savoir où l'on est.
 */
export function AppHeader({
  app,
  nav = [],
  signedIn,
}: {
  app: string;
  nav?: Array<{ href: string; label: string }>;
  signedIn: boolean;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 w-full bg-flag text-ink">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="-ml-1 flex shrink-0 items-center gap-2 rounded-sm focus-visible:outline-ink"
          aria-label={`Flagscore ${app}, accueil`}
        >
          <Image
            src="/flagscore-logo.png"
            alt="Flagscore"
            width={410}
            height={281}
            className="h-9 w-auto sm:h-11"
            priority
          />
          <span className="font-score text-xl font-black">{app}</span>
        </Link>

        {signedIn && (
          <nav
            className="ml-auto flex items-stretch self-stretch"
            aria-label="Navigation"
          >
            {nav.map(link => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "relative flex items-center px-2 text-sm font-semibold tracking-wide focus-visible:outline-ink focus-visible:-outline-offset-4 sm:px-3",
                  isActive(link.href)
                    ? "text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:bg-ink sm:after:inset-x-3"
                    : "text-ink/75 hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            ))}
            <form action="/auth/signout" method="post" className="flex">
              <button
                type="submit"
                className="px-2 text-sm font-semibold text-ink/75 hover:text-ink focus-visible:outline-ink focus-visible:-outline-offset-4 sm:px-3"
              >
                Déconnexion
              </button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
