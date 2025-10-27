"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full bg-gray-800 border-b border-gray-600 relative z-10">
      <div className="mx-auto px-4 sm:px-8">
        <div className="flex h-20 sm:h-16 items-center justify-between">
          {/* Logo centré en mobile, à gauche en desktop */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/flagscore-logo-removebg-preview.png"
                alt="logo FlagScore.fr"
                width={250}
                height={125}
                className="h-20 md:h-20 sm:h-16 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Menu desktop à droite */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className={`text-sm transition-colors ${
                isActive("/") ? "text-white" : "text-white/80 hover:text-white"
              }`}
            >
              Résultats
            </Link>
            <Link
              href="/classements"
              className={`text-sm transition-colors ${
                isActive("/classements")
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Classements
            </Link>
            <Link
              href="/recherche"
              className={`text-sm transition-colors ${
                isActive("/recherche")
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Recherche
            </Link>
            <Link
              href="/a-propos"
              className={`text-sm transition-colors ${
                isActive("/a-propos")
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              À propos
            </Link>
            {process.env.NODE_ENV === "development" && (
              <>
                <Link
                  href="/monitoring"
                  className={`text-sm transition-colors ${
                    isActive("/monitoring")
                      ? "text-white"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Monitoring
                </Link>
                <Link
                  href="/logs-monitor"
                  className={`text-sm transition-colors ${
                    isActive("/logs-monitor")
                      ? "text-white"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Logs
                </Link>
                <Link
                  href="/test-teams-sync"
                  className={`text-sm transition-colors ${
                    isActive("/test-teams-sync")
                      ? "text-white"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Test Teams
                </Link>
                <Link
                  href="/create-teams-table"
                  className={`text-sm transition-colors ${
                    isActive("/create-teams-table")
                      ? "text-white"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Create Table
                </Link>
              </>
            )}
          </div>

          {/* Bouton mobile menu à droite */}
          <button
            className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
            onClick={toggleMobileMenu}
            aria-label="Ouvrir le menu"
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800 border-t border-gray-600">
            <nav className="flex flex-col py-4">
              <Link
                href="/"
                className={`px-4 py-3 transition-colors ${
                  isActive("/")
                    ? "text-white bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
                onClick={closeMobileMenu}
              >
                Résultats
              </Link>
              <Link
                href="/classements"
                className={`px-4 py-3 transition-colors ${
                  isActive("/classements")
                    ? "text-white bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
                onClick={closeMobileMenu}
              >
                Classements
              </Link>
              <Link
                href="/recherche"
                className={`px-4 py-3 transition-colors ${
                  isActive("/recherche")
                    ? "text-white bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
                onClick={closeMobileMenu}
              >
                Recherche
              </Link>
              <Link
                href="/a-propos"
                className={`px-4 py-3 transition-colors ${
                  isActive("/a-propos")
                    ? "text-white bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
                onClick={closeMobileMenu}
              >
                À propos
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
