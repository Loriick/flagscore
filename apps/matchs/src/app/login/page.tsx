import type { Metadata } from "next";

import { MATCHS_APP_NAME } from "@flagscore/core/sheets";
import { LoginForm } from "@flagscore/ui/LoginForm";

import { login } from "./actions";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <LoginForm
      title={MATCHS_APP_NAME}
      intro="Pour les délégués de match. Saisis l'adresse email à laquelle tu as reçu ton invitation : tu reçois un lien de connexion, sans mot de passe."
      action={login}
      next={next}
      error={error}
    />
  );
}
