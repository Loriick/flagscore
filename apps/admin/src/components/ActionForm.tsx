"use client";

import { useActionState } from "react";

import { cn, primaryButtonClass } from "@flagscore/ui/styles";

import type { ActionState } from "@/app/plateaux/actions";

/** Formulaire relié à une action serveur, avec son message de retour. */
export function ActionForm({
  action,
  submitLabel,
  buttonClass = primaryButtonClass,
  confirmMessage,
  className,
  children,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  buttonClass?: string;
  confirmMessage?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
  });
  return (
    <form
      action={formAction}
      onSubmit={e => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={className}
    >
      {children}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Envoi…" : submitLabel}
      </button>
      {state.status !== "idle" && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "mt-2 text-sm",
            state.status === "error" ? "text-alert" : "text-stone"
          )}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
