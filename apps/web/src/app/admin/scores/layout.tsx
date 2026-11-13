import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Validation des scores",
  robots: { index: false, follow: false },
};

export default function AdminScoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
