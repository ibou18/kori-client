"use client";

import { motion } from "framer-motion";
import { Clock3, MapPin, ShieldCheck, Star } from "lucide-react";
import { fadeInUp, staggerContainer, viewportOnce } from "./animations";
import { SectionHeading } from "./SectionHeading";

const benefits = [
  {
    icon: MapPin,
    title: "Près de chez vous",
    description:
      "Géolocalisation précise et profils complets : photos, prestations, tarifs.",
    span: "lg:col-span-2",
    accent: "from-primary/15 to-transparent",
  },
  {
    icon: Clock3,
    title: "24 h / 24",
    description: "Réservez le soir, le dimanche, entre deux métros.",
    span: "",
    accent: "from-[#D9A441]/20 to-transparent",
  },
  {
    icon: Star,
    title: "Avis authentiques",
    description:
      "Seuls les clients ayant réellement réservé peuvent laisser un avis.",
    span: "",
    accent: "from-[#D9A441]/20 to-transparent",
  },
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    description:
      "Acompte protégé via Stripe. Le reste se règle au salon, comme d'habitude.",
    span: "lg:col-span-2",
    accent: "from-primary/15 to-transparent",
  },
];

/** Grille « bento » des avantages côté client. */
export function ClientBenefits() {
  return (
    <section className="bg-[#F7F1E8] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pourquoi korí"
          title="Pensé pour vos cheveux, votre style, votre emploi du temps."
          description="Tresses, locs, coupes, barbe, ongles : des spécialistes qui connaissent leur métier, et une réservation qui ne vous fait pas perdre de temps."
        />

        <motion.div
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {benefits.map((benefit) => (
            <motion.article
              key={benefit.title}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-3xl border border-gray-900/5 bg-white p-8 shadow-sm ${benefit.span}`}
            >
              <div
                aria-hidden
                className={`absolute inset-0 bg-gradient-to-br ${benefit.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <benefit.icon className="size-5" />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-gray-600">{benefit.description}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
