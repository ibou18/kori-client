"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { useSendMail } from "@/app/data/hooks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { message } from "antd";
import { Lightbulb, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

/**
 * Page de support korí – permet d'envoyer un message au support et de consulter des astuces.
 */
export default function Support(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: sendMail } = useSendMail();

  const [mailMessage, setMailMessage] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendMail(mailMessage, {
        onSuccess: () => {
          setMailMessage({
            name: "",
            email: "",
            subject: "",
            message: "",
          });
          setIsLoading(false);
          message.success("Message envoyé avec succès!");
        },
        onError: () => {
          setIsLoading(false);

          message.error("Une erreur est survenue");
        },
      });
      // Ajoutez ici votre logique d'envoi de message
    } catch (error) {
      setIsLoading(false);

      message.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMailMessage({
      ...mailMessage,
      [e.target.name]: e.target.value,
    });
  };

  const faqs = [
    {
      question: "Comment fonctionne Kori ?",
      answer:
        "Kori est une plateforme de mise en relation pour des prestations du quotidien. Vous pouvez réserver des services (coiffure, esthétique, massage, etc.) ou proposer vos propres services. Tout se fait en ligne avec paiement sécurisé via Stripe.",
    },
    {
      question: "Comment réserver une prestation ?",
      answer:
        "Parcourez les prestataires disponibles, sélectionnez le service souhaité, choisissez votre créneau horaire et effectuez le paiement en ligne. Vous recevrez une confirmation par e-mail avec tous les détails de votre rendez-vous.",
    },
    {
      question: "Comment proposer mes services sur Kori ?",
      answer:
        "Créez votre profil de prestataire, ajoutez vos services avec descriptions et photos, définissez vos tarifs et disponibilités. Une fois validé, vos services apparaîtront dans les résultats de recherche.",
    },
    {
      question: "Comment fonctionnent les paiements ?",
      answer:
        "Chaque réservation comprend un acompte de 15% versé au prestataire et des frais de réservation de 6% perçus par Kori (avec taxes). Le solde de 79% est payé directement au prestataire le jour du rendez-vous. Tous les montants sont clairement affichés avant confirmation.",
    },
    {
      question: "Puis-je annuler ma réservation ?",
      answer:
        "Oui, vous pouvez annuler votre réservation jusqu'à 24h avant le rendez-vous pour obtenir un remboursement intégral. En cas d'annulation par le prestataire, le remboursement est automatique.",
    },
    {
      question: "Comment sécuriser mes transactions ?",
      answer:
        "Tous les paiements passent par Stripe, garantissant la sécurité de vos données bancaires. Ne payez jamais en dehors de la plateforme. Signalez tout comportement suspect au support.",
    },
    {
      question: "Comment gérer mes réservations ?",
      answer:
        "Consultez toutes vos réservations dans 'Mes rendez-vous'. Vous pouvez voir l'historique, les prochains rendez-vous, et gérer vos annulations depuis cette section.",
    },
    {
      question: "Comment noter un prestataire ?",
      answer:
        "Après chaque prestation, évaluez votre expérience (1 à 5 étoiles) et laissez un commentaire. Cela aide les autres utilisateurs à choisir les meilleurs prestataires.",
    },
    {
      question: "Quels types de prestations sont disponibles ?",
      answer:
        "Une large gamme de services : coiffure, esthétique, massage, manucure, pédicure, soins du visage, épilation, maquillage, et bien d'autres. Chaque prestataire peut proposer ses spécialités.",
    },
    {
      question: "Comment contacter un prestataire ?",
      answer:
        "Vous pouvez contacter le prestataire via la messagerie intégrée de Kori après avoir effectué une réservation. Cela permet d'échanger sur les détails de la prestation en toute sécurité.",
    },
    {
      question: "Que faire en cas de problème ?",
      answer:
        "Contactez notre support client via le formulaire de contact ou à support@koribeauty.com. Nous nous engageons à résoudre rapidement tout problème lié à votre expérience sur la plateforme.",
    },
    {
      question: "Quels sont les frais de service ?",
      answer:
        "Kori perçoit 6% du montant de la prestation à titre de frais de réservation (avec TVH 5% + TVQ 9,975%). Ces frais couvrent la gestion du système, le support client et la maintenance technique. L'acompte de 15% va directement au prestataire et n'est pas taxé par Kori.",
    },
  ];

  return (
    <PageWrapper title="Support Kori">
      <div className="max-w-5xl mx-auto space-y-8">
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Nous contacter
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Aide & Astuces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contactez-nous</CardTitle>
                <CardDescription>
                  Nous sommes là pour vous aider. Envoyez-nous votre message.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom</label>
                      <Input
                        placeholder="Votre nom"
                        name="name"
                        value={mailMessage.name}
                        required
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="Votre email"
                        name="email"
                        value={mailMessage.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sujet</label>
                    <Input
                      placeholder="Sujet (Réservation, Prestation, Paiement, Autre)"
                      name="subject"
                      value={mailMessage.subject}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Décrivez votre besoin ou votre problème (le plus de détails possible)."
                      name="message"
                      value={mailMessage.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Envoi en cours..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  FAQ interactive
                </CardTitle>
                <CardDescription>
                  Trouvez rapidement des réponses aux questions les plus
                  fréquentes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
