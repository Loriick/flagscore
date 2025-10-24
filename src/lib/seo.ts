import { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  image?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
  structuredData?: any;
}

const baseUrl = "https://flagscore.fr";
const siteName = "Flagscore";
const defaultImage = {
  url: "/flagscore-logo-removebg-preview.png",
  width: 1200,
  height: 630,
  alt: "Flagscore - Résultats Flag Football France",
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    noindex = false,
    nofollow = false,
    image = defaultImage,
  } = config;

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;

  return {
    title: fullTitle,
    description,
    keywords: [
      "flag football",
      "championnat france",
      "coupe france",
      "résultats",
      "scores",
      "classements",
      "sport",
      "football américain",
      "FFFA",
      ...keywords,
    ],
    authors: [{ name: "Flagscore" }],
    creator: "Flagscore",
    publisher: "Flagscore",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: canonicalUrl,
      siteName,
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.url],
      creator: "@flagscore",
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_CODE,
      yandex: process.env.YANDEX_VERIFICATION_CODE,
      yahoo: process.env.YAHOO_VERIFICATION_CODE,
    },
    category: "Sports",
    classification: "Flag Football Results",
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "theme-color": "#000000",
    },
  };
}

// Specific metadata for pages
export const pageMetadata = {
  home: generateMetadata({
    title: "Accueil",
    description:
      "Consultez tous les résultats du championnat de France de flag football et de la coupe de France. Scores en temps réel, classements par poule et statistiques détaillées des équipes.",
    keywords: [
      "flag football france",
      "championnat flag football",
      "coupe france flag football",
      "résultats flag football",
      "scores flag football",
      "classements flag football",
      "FFFA",
      "fédération française flag football",
    ],
    canonical: "/",
  }),

  rankings: generateMetadata({
    title: "Classements",
    description:
      "Consultez les classements officiels du championnat de France de flag football et de la coupe de France. Classements par poule avec statistiques détaillées des équipes.",
    keywords: [
      "classements flag football",
      "classement championnat france",
      "classement coupe france",
      "statistiques équipes",
      "points équipes",
      "victoires défaites",
    ],
    canonical: "/classements",
  }),

  about: generateMetadata({
    title: "À propos",
    description:
      "Découvrez Flagscore, la plateforme officielle des résultats du flag football en France. Informations sur le championnat, la coupe de France et la FFFA.",
    keywords: [
      "à propos flagscore",
      "flag football france",
      "FFFA",
      "fédération française flag football",
      "championnat france",
      "coupe france",
      "histoire flag football",
    ],
    canonical: "/a-propos",
  }),

  monitoring: generateMetadata({
    title: "Monitoring",
    description:
      "Tableau de bord de monitoring et métriques de performance de Flagscore.",
    keywords: ["monitoring", "métriques", "performance", "statistiques"],
    canonical: "/monitoring",
    noindex: true, // Ne pas indexer les pages de monitoring
  }),
};

// Common structured data
export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Flagscore",
    description:
      "Plateforme officielle des résultats du flag football en France",
    url: "https://flagscore.fr",
    logo: "https://flagscore.fr/flagscore-logo-removebg-preview.png",
    sameAs: ["https://twitter.com/flagscore", "https://facebook.com/flagscore"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@flagscore.fr",
    },
  },

  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Flagscore",
    description:
      "Résultats du championnat de France de flag football et de la coupe de France",
    url: "https://flagscore.fr",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://flagscore.fr/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Flagscore",
      url: "https://flagscore.fr",
    },
  },

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }),

  sportsEvent: (event: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      "@type": "Place",
      name: event.location,
    },
    sport: "Flag Football",
    organizer: {
      "@type": "Organization",
      name: "FFFA",
      url: "https://fffa.fr",
    },
  }),
};
