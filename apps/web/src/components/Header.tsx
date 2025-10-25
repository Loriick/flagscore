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
          <div className="flex-1 flex justify-center md:justify-start">
            <Image
              src="/flagscore-logo-removebg-preview.png"
              alt="logo FlagScore.fr"
              width={300}
              height={150}
              className="h-20 sm:h-16 w-auto object-contain"
              priority
            />
          </div>

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
              </>
            )}
          </div>

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
