import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-black relative z-10">
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
            <Link href="/" className="text-white/80 hover:text-white text-sm">
              Résultats
            </Link>
            <Link
              href="/classements"
              className="text-white/80 hover:text-white text-sm"
            >
              Classements
            </Link>
            <Link
              href="/a-propos"
              className="text-white/80 hover:text-white text-sm"
            >
              À propos
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
