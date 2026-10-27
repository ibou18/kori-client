"use client";

import { motion } from "framer-motion";
import { CalendarClock, Search, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer, viewportOnce } from "./animations";
import { SectionHeading } from "./SectionHeading";

const steps = [
  {
    number: "01",
    title: "Trouvez votre pro",
    description:
      "Parcourez les salons et indépendants près de chez vous. Photos, prestations, avis : tout est là.",
    icon: Search,
  },
  {
    number: "02",
    title: "Choisissez votre créneau",
    description:
      "Agenda en temps réel. Sélectionnez la prestation, l'heure qui vous convient et confirmez.",
    icon: CalendarClock,
  },
  {
    number: "03",
    title: "Profitez, on s'occupe du reste",
    description:
      "Rappel automatique avant le rendez-vous, acompte sécurisé et avis après la prestation.",
    icon: Sparkles,
  },
];

/** Parcours de réservation côté client en 3 étapes. */
export function HowItWorks() {
  return (
    <section className="relative bg-[#FEFCF9] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Réserver"
          title={
            <>
              Trois étapes, <span className="text-primary">zéro appel</span>.
            </>
          }
          description="Plus besoin d'appeler ou d'attendre une réponse par message. Tout se passe dans l'app, à n'importe quelle heure."
        />

        <motion.ol
          className="relative mt-16 grid gap-6 lg:grid-cols-3"
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {/* Ligne de liaison (desktop) */}
          <motion.div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-14 hidden h-px origin-left bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
          {steps.map((step) => (
            <motion.li
              key={step.number}
              variants={fadeInUp}
              className="group relative rounded-3xl border border-gray-900/5 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(42,55,49,0.35)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <step.icon className="size-5" />
                </span>
                <span className="font-mono text-sm font-semibold text-gray-300">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-3 text-gray-600">{step.description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
