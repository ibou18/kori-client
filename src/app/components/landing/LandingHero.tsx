"use client";

import { Button } from "@/components/ui/button";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { fadeInUp, staggerContainer } from "./animations";
import { PhoneMockup } from "./PhoneMockup";
import { StoreBadges } from "./StoreBadges";

const trustItems = [
  "Confirmation instantanée",
  "Rappels automatiques",
  "Paiement sécurisé",
];

/** Section hero : promesse client + mise en avant « gratuit pour les pros ». */
export function LandingHero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#F7F1E8] pt-16 pb-20 sm:pt-24 lg:pb-28"
    >
      {/* Fond : grille + blobs animés */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(83,116,93,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(83,116,93,0.07)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <motion.div
        aria-hidden
        style={{ y: blobY }}
        className="pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl animate-blob"
      />
      <motion.div
        aria-hidden
        style={{ y: blobY }}
        className="pointer-events-none absolute -right-24 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[#D9A441]/25 blur-3xl animate-blob [animation-delay:3s]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <motion.div
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left"
        >
          <motion.div variants={fadeInUp}>
            <Link
              href="/inscription"
              className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 py-1.5 pl-1.5 pr-4 text-sm font-medium text-gray-800 shadow-sm backdrop-blur transition hover:border-primary/40 hover:bg-white"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                <Sparkles className="size-3" />
                Pros
              </span>
              100 % gratuit pour les professionnels
              <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl"
          >
            Votre prochain rendez-vous{" "}
            <span className="relative inline-block text-primary">
              beauté
              <motion.span
                aria-hidden
                className="absolute -bottom-1 left-0 h-[0.14em] w-full origin-left rounded-full bg-[#D9A441]/70"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>{" "}
            se réserve en 2 minutes.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-xl text-pretty text-lg text-gray-600 sm:text-xl lg:mx-0"
          >
            Coiffure, tresses, barbier, manucure, soins : korí réunit les
            meilleurs pros près de chez vous. Choisissez un créneau, confirmez,
            c&apos;est réservé.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center"
          >
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-7 text-base shadow-[0_12px_30px_-10px_rgba(83,116,93,0.7)] transition-transform hover:-translate-y-0.5"
            >
              <a href="#telecharger">
                Réserver avec l&apos;app
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-gray-900/15 bg-white/70 px-7 text-base backdrop-blur hover:bg-white"
            >
              <Link href="/inscription">
                <Store className="size-4" />
                Je suis pro, je m&apos;inscris
              </Link>
            </Button>
          </motion.div>

          <motion.ul
            variants={fadeInUp}
            className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 lg:justify-start"
          >
            {trustItems.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-primary" />
                {item}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={fadeInUp} className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Disponible sur iOS et Android
            </p>
            <StoreBadges
              size="sm"
              className="justify-center lg:justify-start"
            />
          </motion.div>
        </motion.div>

        <motion.div style={{ y: phoneY }} className="relative py-6 lg:py-0">
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}
