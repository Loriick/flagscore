import type { Metadata } from "next";

import { requireRole } from "@flagscore/core/auth/server";

export const metadata: Metadata = { title: "Validation des scores" };

export default async function ScoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin"]);
  return children;
}
