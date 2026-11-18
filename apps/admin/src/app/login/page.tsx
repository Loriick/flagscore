import type { Metadata } from "next";

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
      title="Admin"
      intro="Réservé aux gestionnaires de Flagscore. Tu reçois un lien de connexion par email, sans mot de passe."
      action={login}
      next={next}
      error={error}
    />
  );
}
