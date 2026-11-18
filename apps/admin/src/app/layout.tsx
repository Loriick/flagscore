import type { Metadata } from "next";
import { Big_Shoulders, Geist } from "next/font/google";
import { Toaster } from "sonner";

import { getSession } from "@flagscore/core/auth/server";
import { AppHeader } from "@flagscore/ui/AppHeader";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: { default: "Flagscore Admin", template: "%s | Flagscore Admin" },
  robots: { index: false, follow: false },
};

const NAV = [{ href: "/scores", label: "Scores" }];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${bigShoulders.variable} min-h-dvh antialiased`}
      >
        <AppHeader app="Admin" nav={NAV} signedIn={session?.role === "admin"} />
        <main>{children}</main>
        <Toaster theme="dark" position="bottom-center" />
      </body>
    </html>
  );
}
