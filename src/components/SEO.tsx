"use client";

import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
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

export function SEO({
  title,
  description,
  keywords = [],
  canonical,
  noindex = false,
  nofollow = false,
  image,
  structuredData,
}: SEOProps) {
  const siteName = "Flagscore";
  const baseUrl = "https://flagscore.fr";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const defaultImage = {
    url: "/flagscore-logo-removebg-preview.png",
    width: 1200,
    height: 630,
    alt: "Flagscore - Résultats Flag Football France",
  };
  const ogImage = image || defaultImage;

  return (
    <Head>
      {/* Balises de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      <meta
        name="robots"
        content={`${noindex ? "noindex" : "index"}, ${
          nofollow ? "nofollow" : "follow"
        }`}
      />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={`${baseUrl}${ogImage.url}`} />
      <meta property="og:image:width" content={ogImage.width.toString()} />
      <meta property="og:image:height" content={ogImage.height.toString()} />
      <meta property="og:image:alt" content={ogImage.alt} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}${ogImage.url}`} />
      <meta name="twitter:creator" content="@flagscore" />
      <meta name="twitter:site" content="@flagscore" />

      {/* Données structurées */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Balises supplémentaires */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
    </Head>
  );
}
