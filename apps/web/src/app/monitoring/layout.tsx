import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitoring | Flagscore",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

