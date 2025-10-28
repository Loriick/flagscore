import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hors ligne | Flagscore",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
