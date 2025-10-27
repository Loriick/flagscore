import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CacheBuster } from "../components/CacheBuster";
import { ErrorBoundary } from "../components/ErrorBoundary";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { OfflineIndicator } from "../components/OfflineIndicator";
import { PerformanceMonitor } from "../components/PerformanceMonitor";
import { PreloadManager } from "../components/PreloadManager";
import { QueryProvider } from "../components/QueryProvider";
import { ServiceWorkerManager } from "../components/ServiceWorkerManager";
import { getBaseUrl, getShareImageUrl, structuredData } from "../lib/seo";

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
    "Découvrez tous les résultats du championnat de France de flag football et de la coupe de France. Classements et résultats des matchs.",
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
  authors: [{ name: "Flagscore", url: getBaseUrl() }],
  creator: "Flagscore",
  publisher: "Flagscore",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(getBaseUrl()),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": getBaseUrl(),
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: getBaseUrl(),
    siteName: "Flagscore",
    title: "Flagscore - Résultats Flag Football France",
    description:
      "Découvrez tous les résultats du championnat de France de flag football et de la coupe de France. Classements et résultats des matchs.",
    images: [
      {
        url: getShareImageUrl(),
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
    images: [getShareImageUrl()],
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
    icon: [{ url: "/favicon.ico?v=3", sizes: "any" }],
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
        {/* Global structured data */}
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

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="https://api.example.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative bg-linear-to-br from-gray-900 via-blue-900 to-gray-900`}
      >
        <CacheBuster />
        <QueryProvider>
          <ServiceWorkerManager>
            <PreloadManager>
              <PerformanceMonitor>
                <ErrorBoundary>
                  <Header />
                  <main className="min-h-screen">{children}</main>
                  <Footer />
                  <OfflineIndicator />
                  <Toaster />
                  {process.env.NODE_ENV === "production" &&
                    process.env.VERCEL_ANALYTICS_ID && (
                      <>
                        <Analytics />
                        <SpeedInsights />
                      </>
                    )}
                </ErrorBoundary>
              </PerformanceMonitor>
            </PreloadManager>
          </ServiceWorkerManager>
        </QueryProvider>
      </body>
    </html>
  );
}
