"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Image from "next/image";
import { fadeInUp, staggerContainer, viewportOnce } from "./animations";
import { SectionHeading } from "./SectionHeading";

const testimonials = [
  {
    quote:
      "korí m'a permis de trouver la coiffeuse parfaite pour mes tresses. Réservation simple et résultat impeccable !",
    author: "Amina Benali",
    role: "Cliente",
    avatar:
      "https://ui-avatars.com/api/?name=Amina+Benali&background=53745D&color=fff&size=100",
  },
  {
    quote:
      "En tant que coiffeuse spécialisée, korí m'apporte de nouveaux clients chaque semaine. Et je ne paie rien, c'est ça le plus fou.",
    author: "Marie-Claire N'Diaye",
    role: "Coiffeuse",
    avatar:
      "https://ui-avatars.com/api/?name=Marie+Claire&background=D9A441&color=fff&size=100",
  },
  {
    quote:
      "J'ai réservé ma coupe en 2 minutes. Le salon était exactement comme décrit et le service parfait !",
    author: "Fatima Ouali",
    role: "Cliente",
    avatar:
      "https://ui-avatars.com/api/?name=Fatima+Ouali&background=34463E&color=fff&size=100",
  },
];

/** Témoignages clients et pros. */
export function Testimonials() {
  return (
    <section className="bg-[#FEFCF9] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Témoignages"
          title="Ils ont réservé. Ils ont recommandé."
        />
        <motion.div
          className="mt-16 grid gap-6 md:grid-cols-3"
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.author}
              variants={fadeInUp}
              className={`relative flex flex-col rounded-3xl border border-gray-900/5 bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 ${
                i === 1 ? "md:-translate-y-4 md:hover:-translate-y-5" : ""
              }`}
            >
              <Quote className="absolute right-6 top-6 size-8 text-primary/10" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className="size-4 fill-[#D9A441] text-[#D9A441]"
                  />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-pretty text-gray-700">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {t.author}
                  </p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
