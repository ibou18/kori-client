"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fadeInUp, viewportOnce } from "./animations";
import { SectionHeading } from "./SectionHeading";

const faqs = [
  {
    question: "korí est-il vraiment gratuit pour les professionnels ?",
    answer:
      "Oui. Aucun abonnement, aucun frais d'inscription, aucun engagement et aucune carte bancaire demandée. Vous créez votre salon et commencez à recevoir des réservations sans rien payer.",
  },
  {
    question: "Comment réserver une prestation ?",
    answer:
      "Téléchargez l'app, trouvez un pro près de chez vous, choisissez la prestation et le créneau, puis confirmez. Vous recevez une confirmation immédiate et un rappel avant le rendez-vous.",
  },
  {
    question: "Les paiements sont-ils sécurisés ?",
    answer:
      "Oui. L'acompte versé à la réservation passe par Stripe. Vos informations bancaires ne sont jamais stockées par korí.",
  },
  {
    question: "Puis-je annuler ma réservation ?",
    answer:
      "Oui, depuis l'app, selon la politique d'annulation du prestataire. Les conditions sont affichées avant de confirmer.",
  },
  {
    question: "Je suis coiffeuse à domicile, puis-je m'inscrire ?",
    answer:
      "Bien sûr. korí accueille les salons comme les indépendants : à domicile, en studio ou en déplacement. Vous paramétrez vos lieux de prestation.",
  },
  {
    question: "korí est-il disponible dans ma région ?",
    answer:
      "korí se développe progressivement au Canada. Ouvrez l'app pour voir les prestataires disponibles autour de vous.",
  },
];

/** Foire aux questions clients et pros. */
export function Faq() {
  return (
    <section className="bg-[#F7F1E8] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions fréquentes"
          description="Tout ce que vous devez savoir avant de réserver ou de vous inscrire."
        />

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-12 rounded-3xl border border-gray-900/5 bg-white px-6 shadow-sm sm:px-8"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-gray-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-10 text-center"
        >
          <p className="text-gray-600">Une autre question ?</p>
          <Button asChild variant="link" className="mt-1 text-base">
            <Link href="/support">
              Contactez-nous
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
