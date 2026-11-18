import type { Metadata } from "next";

import { requireRole } from "@flagscore/core/auth/server";
import { cn, pageTitleClass } from "@flagscore/ui/styles";

import { PlateauForm } from "@/components/PlateauForm";

export const metadata: Metadata = { title: "Nouveau plateau" };

export default async function NewPlateauPage() {
  await requireRole(["admin"]);
  return (
    <div className="mx-auto max-w-3xl px-4 pt-5 pb-16 sm:px-6 sm:pt-10">
      <h1 className={cn(pageTitleClass, "mb-6")}>Nouveau plateau</h1>
      <PlateauForm />
    </div>
  );
}
