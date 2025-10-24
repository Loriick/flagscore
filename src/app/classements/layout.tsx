import { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata.rankings;

export default function RankingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
