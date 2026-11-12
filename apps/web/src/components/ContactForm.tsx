"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("📧 Tentative d'envoi de message:", { title, message });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, message }),
      });

      const data = await response.json();

      console.log("📧 Réponse API contact:", { status: response.status, data });

      if (response.ok) {
        console.log("✅ Message envoyé avec succès:", data.id);
        toast.success("Message envoyé avec succès !");
        setTitle("");
        setMessage("");
      } else {
        console.error("❌ Erreur lors de l'envoi:", data.error);
        toast.error(data.error || "Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      toast.error("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="contact-title"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-stone"
        >
          Objet
        </label>
        <input
          type="text"
          id="contact-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded-[4px] border border-line bg-ink-raised px-3 py-2.5 text-chalk placeholder:text-stone hover:border-stone/60"
          placeholder="Une correction de score, une idée…"
          required
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-stone"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={6}
          className="w-full rounded-[4px] border border-line bg-ink-raised px-3 py-2.5 text-chalk placeholder:text-stone hover:border-stone/60"
          placeholder="Votre message"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-11 items-center rounded-[4px] bg-flag px-5 text-sm font-bold text-ink transition-colors hover:bg-flag-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}
