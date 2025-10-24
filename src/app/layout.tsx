import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ErrorBoundary } from "../components/ErrorBoundary";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { structuredData } from "../lib/seo";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Flagscore - Résultats Flag Football France",
    template: "%s | Flagscore",
  },
  description:
    "Découvrez tous les résultats du championnat de France de flag football et de la coupe de France. Scores en temps réel, classements et statistiques des équipes.",
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
    "fédération française flag football",
    "sport français",
    "compétition sportive",
  ],
  authors: [{ name: "Flagscore", url: "https://flagscore.fr" }],
  creator: "Flagscore",
  publisher: "Flagscore",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://flagscore.fr"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "https://flagscore.fr",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://flagscore.fr",
    siteName: "Flagscore",
    title: "Flagscore - Résultats Flag Football France",
    description:
      "Découvrez tous les résultats du championnat de France de flag football et de la coupe de France. Scores en temps réel, classements et statistiques des équipes.",
    images: [
      {
        url: "/flagscore-logo-removebg-preview.png",
        width: 1200,
        height: 630,
        alt: "Flagscore - Résultats Flag Football France",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flagscore - Résultats Flag Football France",
    description:
      "Découvrez tous les résultats du championnat de France de flag football et de la coupe de France.",
    images: ["/flagscore-logo-removebg-preview.png"],
    creator: "@flagscore",
    site: "@flagscore",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#000000",
      },
    ],
  },
  manifest: "/site.webmanifest",
  category: "Sports",
  classification: "Flag Football Results",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#000000",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark bg-black">
      <head>
        {/* Données structurées globales */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.organization),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.website),
          }}
        />

        {/* Preconnect pour les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch pour les domaines externes */}
        <link rel="dns-prefetch" href="https://api.example.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative bg-black`}
      >
        <ErrorBoundary>
          <Header />
          <main className="min-h-screen bg-black">{children}</main>
          <Footer />
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </ErrorBoundary>
      </body>
    </html>
  );
}
