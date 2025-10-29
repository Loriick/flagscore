import type { Metadata } from "next";

import { RechercheContent } from "../../components/RechercheContent";
import { getBaseUrl, pageMetadata } from "../../lib/seo";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams?: { q?: string };
}

export function generateMetadata({ searchParams }: SearchPageProps): Metadata {
  const q = searchParams?.q?.trim();
  const title = q && q.length >= 2 ? `Recherche: ${q}` : "Recherche";
  return {
    ...pageMetadata.home, // inherit base site metadata
    title: `${title} | Flagscore`,
    alternates: {
      canonical: q
        ? `${getBaseUrl()}/recherche?q=${encodeURIComponent(q)}`
        : `${getBaseUrl()}/recherche`,
    },
  };
}
export default function RecherchePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <RechercheContent />
      </div>
    </div>
  );
}
