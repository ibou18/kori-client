"use client";

import { Button } from "@/components/ui/button";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  CreditCard,
  Share2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fadeInUp, staggerContainer, viewportOnce } from "./animations";
import { SectionHeading } from "./SectionHeading";

const proFeatures = [
  {
    icon: CalendarDays,
    title: "Agenda intelligent",
    description: "Vos créneaux, vos pauses, vos jours off. Fini les doubles réservations.",
  },
  {
    icon: BellRing,
    title: "Rappels automatiques",
    description: "SMS et notifications envoyés à vos clients. Moins de no-show.",
  },
  {
    icon: CreditCard,
    title: "Acompte à la réservation",
    description: "Un acompte sécurisé versé à la réservation pour protéger votre temps.",
  },
  {
    icon: Share2,
    title: "Page salon partageable",
    description: "Un lien à mettre sur Instagram, TikTok ou WhatsApp. Vos clients réservent seuls.",
  },
  {
    icon: Users,
    title: "Gestion d'équipe",
    description: "Invitez vos employés, chacun gère son propre agenda.",
  },
];

const comparison = [
  { label: "Abonnement mensuel", elsewhere: "29 à 99 $/mois", kori: "0 $" },
  { label: "Frais d'inscription", elsewhere: "Souvent", kori: "0 $" },
  { label: "Engagement", elsewhere: "12 mois", kori: "Aucun" },
  { label: "Carte bancaire requise", elsewhere: "Oui", kori: "Non" },
];

/** « 0 $ » qui s'anime depuis une valeur haute jusqu'à zéro. */
function CountdownToZero() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? 0 : 99);

  useEffect(() => {
    if (!inView || reduce) return;
    const start = performance.now();
    const duration = 1600;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(99 * (1 - eased)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}&nbsp;$
    </span>
  );
}

/** Section dédiée aux professionnels : gratuité mise en avant. */
export function ProFreeSection() {
  return (
    <section
      id="pros"
      className="relative scroll-mt-16 overflow-hidden bg-[#2A3731] py-24 text-white sm:py-32"
    >
      {/* Décor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(83,116,93,0.55),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(217,164,65,0.25),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              tone="dark"
              eyebrow="Pour les professionnels"
              title={
                <>
                  Gratuit pour les pros.{" "}
                  <span className="text-[#D9A441]">Pour de vrai.</span>
                </>
              }
              description="Pas d'abonnement, pas de frais d'inscription, pas d'engagement. Créez votre salon, publiez vos prestations et recevez vos premières réservations aujourd'hui."
            />

            <motion.div
              variants={staggerContainer(0.1, 0.2)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-10"
            >
              <motion.div
                variants={fadeInUp}
                className="flex items-end gap-4 border-l-2 border-[#D9A441] pl-5"
              >
                <p className="text-6xl font-semibold leading-none tracking-tight sm:text-7xl">
                  <CountdownToZero />
                </p>
                <p className="pb-1 text-sm text-white/70">
                  par mois,
                  <br />
                  pour toujours.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="mt-10 flex flex-col gap-3 sm:flex-row"
              >
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-[#D9A441] px-7 text-base font-semibold text-[#2A3731] shadow-[0_12px_30px_-10px_rgba(217,164,65,0.8)] transition-transform hover:-translate-y-0.5 hover:bg-[#E3B45C]"
                >
                  <Link href="/inscription">
                    Créer mon salon gratuitement
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/25 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/auth/signin">J&apos;ai déjà un compte</Link>
                </Button>
              </motion.div>
              <motion.p
                variants={fadeInUp}
                className="mt-4 text-sm text-white/60"
              >
                Inscription en 2 minutes. Aucune carte bancaire demandée.
              </motion.p>
            </motion.div>
          </div>

          {/* Tableau comparatif */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur"
          >
            <div className="rounded-2xl bg-[#1f2a25] p-6 sm:p-8">
              <div className="grid grid-cols-[1.2fr_1fr_0.9fr] gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                <span />
                <span className="text-center">Ailleurs</span>
                <span className="text-center text-[#D9A441]">korí</span>
              </div>
              <motion.ul
                className="mt-4 divide-y divide-white/10"
                variants={staggerContainer(0.1, 0.3)}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
              >
                {comparison.map((row) => (
                  <motion.li
                    key={row.label}
                    variants={fadeInUp}
                    className="grid grid-cols-[1.2fr_1fr_0.9fr] items-center gap-3 py-4"
                  >
                    <span className="text-sm text-white/80">{row.label}</span>
                    <span className="flex items-center justify-center gap-1.5 text-sm text-white/50">
                      <X className="size-3.5 text-red-300/80" />
                      {row.elsewhere}
                    </span>
                    <span className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white">
                      <Check className="size-3.5 text-[#D9A441]" />
                      {row.kori}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>

        {/* Fonctionnalités pro */}
        <motion.ul
          className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {proFeatures.map((feature) => (
            <motion.li
              key={feature.title}
              variants={fadeInUp}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-[#D9A441]/40 hover:bg-white/10"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#D9A441] transition-transform group-hover:scale-110">
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-white/60">
                {feature.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
