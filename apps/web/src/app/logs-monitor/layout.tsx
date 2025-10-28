import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitoring des Logs | Flagscore",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function LogsMonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

