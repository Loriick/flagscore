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
          className="block text-sm font-medium text-white/80 mb-2"
        >
          Titre
        </label>
        <input
          type="text"
          id="contact-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Titre de votre message"
          required
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-white/80 mb-2"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Votre message..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        {isSubmitting ? "Envoi en cours..." : "Envoyer"}
      </button>
    </form>
  );
}
