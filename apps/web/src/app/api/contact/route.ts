import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Vérifier que la clé API Resend est configurée
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY n'est pas configurée");
      return NextResponse.json(
        { error: "Configuration email manquante. Contactez l'administrateur." },
        { status: 500 }
      );
    }

    console.log("📧 API Contact - Nouvelle requête reçue");

    const body = await request.json();
    const { title, message } = body;

    console.log("📧 Contenu du message:", {
      title,
      messageLength: message?.length,
    });

    // Validation
    if (!title || !message) {
      console.error("❌ Validation échouée: titre ou message manquant");
      return NextResponse.json(
        { error: "Le titre et le message sont requis" },
        { status: 400 }
      );
    }

    console.log("📧 Envoi de l'email via Resend...");

    // Envoyer l'email via Resend
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Adresse de test Resend (modifiez après configuration du domaine dans Resend)
      to: ["loricktravailleur@gmail.com"], // Votre email de réception
      subject: `Contact Flagscore: ${title}`,
      text: message,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Titre:</strong> ${title}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      console.error("❌ Erreur Resend:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    console.log("✅ Email envoyé avec succès via Resend:", data?.id);

    return NextResponse.json(
      { message: "Email envoyé avec succès", id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur API contact:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
