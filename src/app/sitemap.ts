import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://flagscore.fr";
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/classements`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Ajouter des pages dynamiques pour les saisons
    ...generateSeasonPages(baseUrl, currentDate),
    // Add dynamic pages for competitions
    ...generateCompetitionPages(baseUrl, currentDate),
  ];
}

function generateSeasonPages(
  baseUrl: string,
  currentDate: Date
): MetadataRoute.Sitemap {
  const currentYear = new Date().getFullYear();
  const seasons = [currentYear - 1, currentYear, currentYear + 1];

  return seasons.map(season => ({
    url: `${baseUrl}/saison/${season}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}

function generateCompetitionPages(
  baseUrl: string,
  currentDate: Date
): MetadataRoute.Sitemap {
  const competitions = [
    { id: 464, name: "championnat-france-mixte" },
    { id: 432, name: "coupe-france" },
    { id: 433, name: "championnat-france-masculin" },
  ];

  return competitions.map(competition => ({
    url: `${baseUrl}/competition/${competition.id}/${competition.name}`,
    lastModified: currentDate,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));
}
