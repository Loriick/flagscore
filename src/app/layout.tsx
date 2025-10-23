import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import Footer from "../components/Footer";
import Header from "../components/Header";

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
  ],
  authors: [{ name: "Flagscore" }],
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
    google: "your-google-verification-code",
  },
  icons: {
    icon: "/favicon.ico?v=3",
    shortcut: "/favicon.ico?v=3",
    apple: "/favicon.ico?v=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=3" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
