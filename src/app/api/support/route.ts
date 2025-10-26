/* eslint-disable @typescript-eslint/no-explicit-any */

import { EmailForAdmin } from "@/app/components/emails/email-for-admin";
import { EmailTemplate } from "@/app/components/emails/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { subject, message, user } = await req.json();

    console.log("Sujet:", subject);
    console.log("Message:", message);
    console.log("Utilisateur:", user);

    if (!subject || !message) {
      return new Response(
        JSON.stringify({
          error: "Les champs 'subject' et 'message' sont obligatoires.",
        }),
        { status: 400 }
      );
    }

    const emailResponse: any = await resend.emails.send({
      from: "support@mail.s3r.app", // Remplacez par une adresse vérifiée
      to: user.email, // Adresse de réception des emails
      subject: `Assistance - ${subject}`,
      react: EmailTemplate({ firstName: user.firstName, message, subject }),
    });

    await resend.emails.send({
      from: "support@mail.s3r.app", // Remplacez par une adresse vérifiée
      to: "ibdiallo.ca@gmail.com", // Adresse de réception des emails
      subject: `Assistance - ${subject}`,
      react: EmailForAdmin({
        firstName: user.firstName,
        lastName: user.lastName,
        message,
        subject,
        email: user.email,
      }),
    });

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.id }),
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Erreur lors de l'envoi de l'email :", error.message);
    } else {
      console.error("Erreur inconnue lors de l'envoi de l'email :", error);
    }
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      { status: 500 }
    );
  }
}
