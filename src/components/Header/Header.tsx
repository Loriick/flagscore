import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-black relative z-10">
      <div className="mx-auto px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 flex justify-center md:justify-start">
            <Image
              src="/flagscore-logo-removebg-preview.png"
              alt="logo FlagScore.fr"
              width={300}
              height={150}
              className="h-16 w-auto object-contain"
              priority
            />
          </div>

          {/* Exemple zone droite (menu desktop ou icône) */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-white/80 hover:text-white text-sm">
              Résultats
            </a>
            <a href="#" className="text-white/80 hover:text-white text-sm">
              Classements
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
