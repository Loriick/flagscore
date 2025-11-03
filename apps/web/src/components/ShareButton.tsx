"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  url: string;
  label?: string;
  className?: string;
}

export function ShareButton({ url, label = "Partager", className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      // Utiliser l'API Web Share si disponible (mobile)
      if (navigator.share) {
        await navigator.share({
          title: "Flagscore - Classements et Résultats",
          url: window.location.origin + url,
        });
        return;
      }

      // Fallback: copier dans le presse-papiers
      const fullUrl = window.location.origin + url;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // L'utilisateur a annulé le partage ou erreur
      console.error("Erreur lors du partage:", error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${className}`}
      aria-label={copied ? "URL copiée" : label}
    >
      {copied ? (
        <>
          <Check size={16} />
          <span>Copié !</span>
        </>
      ) : (
        <>
          <Share2 size={16} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

