import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist } from "next/font/google";

import { getSession } from "@flagscore/core/auth/server";
import { MATCHS_APP_NAME } from "@flagscore/core/sheets";
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
  title: {
    default: `Flagscore ${MATCHS_APP_NAME}`,
    template: `%s | Flagscore ${MATCHS_APP_NAME}`,
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#ffd02b" };

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
        <AppHeader
          app={MATCHS_APP_NAME}
          nav={[{ href: "/", label: "Mes plateaux" }]}
          signedIn={!!session?.role}
        />
        <main>{children}</main>
      </body>
    </html>
  );
}
