"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Store } from "lucide-react";
import Link from "next/link";
import { fadeInUp, staggerContainer, viewportOnce } from "./animations";
import { StoreBadges } from "./StoreBadges";

/** Double appel à l'action final : clients (app) et pros (inscription). */
export function FinalCta() {
  return (
    <section id="telecharger" className="bg-[#FEFCF9] py-24 sm:py-32">
      <motion.div
        className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-2 lg:px-8"
        variants={staggerContainer(0.15)}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {/* Clients */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden rounded-[2rem] bg-primary p-10 text-white sm:p-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl"
          />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            <Smartphone className="size-3.5" />
            Clients
          </span>
          <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Téléchargez korí et réservez votre prochain rendez-vous.
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            Gratuit sur iOS et Android. Vos pros préférés, vos rendez-vous,
            vos rappels : tout au même endroit.
          </p>
          <StoreBadges className="mt-8" size="md" />
        </motion.div>

        {/* Pros */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden rounded-[2rem] border border-gray-900/5 bg-white p-10 sm:p-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-[#D9A441]/20 blur-2xl"
          />
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F6E7C8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A5E14]">
            <Store className="size-3.5" />
            Professionnels
          </span>
          <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Ouvrez votre salon sur korí.{" "}
            <span className="text-primary">0 $, pour toujours.</span>
          </h2>
          <p className="mt-4 max-w-md text-gray-600">
            Agenda, rappels, acomptes, page partageable. Tout ce qu&apos;il
            faut pour remplir votre planning, sans abonnement.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-full px-7 text-base shadow-[0_12px_30px_-10px_rgba(83,116,93,0.7)] transition-transform hover:-translate-y-0.5"
          >
            <Link href="/inscription">
              Créer mon salon gratuitement
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
