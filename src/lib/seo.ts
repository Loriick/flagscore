import { Metadata } from "next";

// Function to get the base URL dynamically based on environment
export function getBaseUrl(): string {
  // In production, use the production domain
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_URL) {
    // If deployed on Vercel with custom domain
    if (process.env.VERCEL_URL.includes("flagscore.fr")) {
      return "https://flagscore.fr";
    }
    // If deployed on Vercel preview (vercel.app domain)
    return `https://${process.env.VERCEL_URL}`;
  }

  // For local development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Fallback to Vercel domain
  return "https://flagscore.vercel.app";
}

// Function to get the share image URL
export function getShareImageUrl(): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/share-image.png`;
}

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
  structuredData?: Record<string, unknown>;
}

const siteName = "Flagscore";
const defaultImage = {
  url: "/share-image.png", // Relative URL - will be resolved by getBaseUrl()
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
    structuredData,
  } = config;

  const baseUrl = getBaseUrl();
  const fullTitle = `${title} | ${siteName}`;
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: siteName, url: baseUrl }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "fr-FR": baseUrl,
      },
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: canonicalUrl,
      siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: image.url.startsWith("http")
            ? image.url
            : `${baseUrl}${image.url}`,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [
        image.url.startsWith("http") ? image.url : `${baseUrl}${image.url}`,
      ],
      creator: "@flagscore",
      site: "@flagscore",
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
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    other: {
      "msapplication-TileColor": "#000000",
      "theme-color": "#000000",
      ...(structuredData || {}),
    },
  };
}

// Specific metadata for pages
export const pageMetadata = {
  home: generateMetadata({
    title: "Accueil",
    description:
      "Consultez tous les résultats du championnat de France de flag football et de la coupe de France. Classements par poule et résultats des matchs.",
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
      "Consultez les classements officiels du championnat de France de flag football et de la coupe de France. Classements par poule avec résultats des équipes.",
    keywords: [
      "classements flag football",
      "classement championnat france",
      "classement coupe france",
      "résultats équipes",
      "points équipes",
      "victoires défaites",
    ],
    canonical: "/classements",
  }),

  about: generateMetadata({
    title: "À Propos",
    description:
      "Découvrez Flagscore, une application dédiée au flag football, offrant des résultats, des classements et des informations pour les championnats et coupes de France.",
    keywords: [
      "flagscore",
      "à propos",
      "flag football france",
      "championnat",
      "coupe france",
      "FFFA",
    ],
    canonical: "/a-propos",
  }),

  monitoring: generateMetadata({
    title: "Monitoring",
    description: "Page de monitoring de l'application Flagscore.",
    keywords: ["monitoring", "métriques", "performance", "statistiques"],
    canonical: "/monitoring",
    noindex: true, // Do not index monitoring pages
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
    url: getBaseUrl(),
    logo: getShareImageUrl(),
    sameAs: ["https://twitter.com/flagscore", "https://facebook.com/flagscore"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contact@flagscore.fr",
      availableLanguage: "French",
    },
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Flagscore",
    url: getBaseUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${getBaseUrl()}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  breadcrumb: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: getBaseUrl(),
      },
    ],
  },
};
