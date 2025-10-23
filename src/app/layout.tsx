import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FieldBackground } from "../components/FieldBackground/FieldBackground";
import Header from "../components/Header/Header";

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
  title: "Flagscore",
  description: "Flagscore is a website that tracks all flag football scores.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <FieldBackground />
        <Header />
        {children}
      </body>
    </html>
  );
}
