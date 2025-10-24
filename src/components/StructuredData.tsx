"use client";

import { useEffect } from "react";

interface StructuredDataProps {
  data: any;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    script.id = `structured-data-${Date.now()}`;

    // Ajouter au head
    document.head.appendChild(script);

    // Nettoyer lors du démontage
    return () => {
      const existingScript = document.getElementById(script.id);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [data]);

  return null; // Ce composant ne rend rien visuellement
}

// Composant pour les données structurées de match
export function MatchStructuredData({
  match,
  homeTeam,
  awayTeam,
}: {
  match: any;
  homeTeam: string;
  awayTeam: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${homeTeam} vs ${awayTeam}`,
    description: `Match de flag football entre ${homeTeam} et ${awayTeam}`,
    startDate: match.date,
    location: {
      "@type": "Place",
      name: "France",
    },
    sport: "Flag Football",
    homeTeam: {
      "@type": "SportsTeam",
      name: homeTeam,
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: awayTeam,
    },
    organizer: {
      "@type": "Organization",
      name: "FFFA",
      url: "https://fffa.fr",
    },
  };

  return <StructuredData data={structuredData} />;
}

// Composant pour les données structurées de classement
export function RankingStructuredData({
  rankings,
  poolName,
}: {
  rankings: any[];
  poolName: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Classement ${poolName}`,
    description: `Classement officiel de la poule ${poolName}`,
    numberOfItems: rankings.length,
    itemListElement: rankings.map((ranking, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SportsTeam",
        name: ranking.club.label,
        description: `Équipe classée ${index + 1} avec ${
          ranking.points
        } points`,
      },
    })),
  };

  return <StructuredData data={structuredData} />;
}

// Composant pour les données structurées de compétition
export function CompetitionStructuredData({
  competition,
}: {
  competition: {
    name: string;
    description: string;
    season: number;
  };
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: competition.name,
    description: competition.description,
    startDate: `${competition.season}-01-01`,
    endDate: `${competition.season}-12-31`,
    location: {
      "@type": "Place",
      name: "France",
    },
    sport: "Flag Football",
    organizer: {
      "@type": "Organization",
      name: "FFFA",
      url: "https://fffa.fr",
    },
  };

  return <StructuredData data={structuredData} />;
}
