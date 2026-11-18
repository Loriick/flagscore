"use client";

import { useActionState } from "react";

import {
  cn,
  inputClass,
  labelClass,
  pageTitleClass,
  primaryButtonClass,
} from "./styles";

type State =
  | { status: "idle" }
  | { status: "sent"; message: string }
  | { status: "error"; message: string };

const ERRORS: Record<string, string> = {
  lien: "Ce lien de connexion a expiré ou a déjà servi. Demande un nouveau lien.",
  acces: "Ce compte n'a pas accès à cette app.",
};

export function LoginForm({
  title,
  intro,
  action,
  next,
  error,
}: {
  title: string;
  intro: string;
  action: (state: State, formData: FormData) => Promise<State>;
  next?: string;
  error?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
  });
  const initialError = error ? ERRORS[error] : undefined;

  return (
    <div className="mx-auto max-w-md px-4 pt-10 pb-16 sm:px-6">
      <h1 className={cn(pageTitleClass, "mb-3")}>{title}</h1>
      <p className="mb-8 text-sm leading-relaxed text-stone">{intro}</p>

      {state.status === "sent" ? (
        <p
          role="status"
          className="border-y border-line py-6 text-base leading-relaxed text-chalk"
        >
          {state.message} Ouvre l&apos;email sur ce téléphone et touche le lien.
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next ?? "/"} />
          <div>
            <label htmlFor="email" className={labelClass}>
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
          {(state.status === "error" || initialError) && (
            <p role="alert" className="text-sm text-alert">
              {state.status === "error" ? state.message : initialError}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className={cn(primaryButtonClass, "w-full")}
          >
            {pending ? "Envoi…" : "Recevoir un lien de connexion"}
          </button>
        </form>
      )}
    </div>
  );
}
