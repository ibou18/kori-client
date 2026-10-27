"use client";

import logoBlack from "@/assets/logo-black.png";
import logoWhite from "@/assets/logo-white.png";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const highlights = [
  "0 $ d'abonnement, pour toujours",
  "Agenda, rappels SMS et acomptes inclus",
  "Page salon partageable en un lien",
];

interface AuthShellProps {
  children: React.ReactNode;
  /** Texte légal affiché sous le formulaire. */
  footer?: React.ReactNode;
}

/**
 * Gabarit plein écran des pages d'authentification :
 * panneau de marque à gauche (desktop), formulaire centré à droite.
 * Les marges négatives annulent le padding vertical du layout locale.
 */
export function AuthShell({ children, footer }: AuthShellProps) {
  const reduce = useReducedMotion();

  return (
    <div className="-my-2 min-h-screen bg-[#F7F1E8] font-[family-name:var(--font-geist-sans)] lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Panneau de marque */}
      <aside className="relative hidden overflow-hidden bg-[#2A3731] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(83,116,93,0.6),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(217,164,65,0.25),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[#D9A441]/20 blur-3xl"
          animate={reduce ? undefined : { y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative">
          <Link href="/" aria-label="Retour à l'accueil korí">
            <Image
              src={logoWhite}
              alt="korí"
              className="h-9 w-auto"
              width={400}
              height={160}
              priority
            />
          </Link>
        </div>

        <motion.div
          className="relative max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            <span className="size-1.5 rounded-full bg-[#D9A441]" />
            Espace professionnel
          </span>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Votre salon, vos rendez-vous,{" "}
            <span className="text-[#D9A441]">sans abonnement.</span>
          </h2>
          <p className="mt-4 text-pretty text-white/70">
            korí connecte votre salon à des clients qui réservent seuls, à
            toute heure. Vous gardez le contrôle de votre agenda.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((item, i) => (
              <motion.li
                key={item}
                className="flex items-center gap-3 text-sm text-white/90"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[#D9A441]">
                  <BadgeCheck className="size-4" />
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.figure
          className="relative max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star key={s} className="size-3.5 fill-[#D9A441] text-[#D9A441]" />
            ))}
          </div>
          <blockquote className="mt-3 text-sm text-white/80">
            « korí m&apos;apporte de nouveaux clients chaque semaine. Et je ne
            paie rien. »
          </blockquote>
          <figcaption className="mt-3 text-xs text-white/50">
            Marie-Claire N&apos;Diaye · Coiffeuse
          </figcaption>
        </motion.figure>
      </aside>

      {/* Colonne formulaire */}
      <main className="flex min-h-screen flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:hidden" aria-label="Accueil korí">
            <Image
              src={logoBlack}
              alt="korí"
              className="h-8 w-auto"
              width={400}
              height={160}
              priority
            />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            Retour au site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </div>

        {footer && (
          <p className="text-balance text-center text-xs text-gray-500 [&_a]:font-medium [&_a]:text-gray-700 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            {footer}
          </p>
        )}
      </main>
    </div>
  );
}
