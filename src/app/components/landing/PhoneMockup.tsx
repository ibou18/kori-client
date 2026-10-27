"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BellRing, CalendarCheck, Star } from "lucide-react";
import Image from "next/image";

interface FloatingCardProps {
  className: string;
  delay: number;
  children: React.ReactNode;
}

/** Petite carte flottante autour du téléphone, animée en boucle. */
function FloatingCard({ className, delay, children }: FloatingCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`absolute z-20 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 p-3 pr-4 shadow-[0_20px_50px_-20px_rgba(42,55,49,0.35)] backdrop-blur ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flex items-center gap-3"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{
          duration: 4 + delay,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Mockup iPhone en CSS avec capture de l'app et cartes flottantes. */
export function PhoneMockup() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px] lg:w-[320px]">
      {/* Halo */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 60, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="relative"
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative rounded-[3rem] border-[10px] border-[#1c1f1d] bg-[#1c1f1d] shadow-[0_40px_80px_-30px_rgba(42,55,49,0.6)]"
        >
          {/* Encoche */}
          <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-[#1c1f1d]" />
          <div className="overflow-hidden rounded-[2.4rem] bg-[#F7F1E8]">
            <Image
              src="/assets/screenshot/2.PNG"
              alt="Aperçu de l'application korí : recherche de services"
              width={1179}
              height={2556}
              priority
              className="h-auto w-full"
            />
          </div>
        </motion.div>
      </motion.div>

      <FloatingCard className="left-0 top-20 sm:-left-24" delay={0.8}>
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarCheck className="size-4" />
        </span>
        <div className="text-left leading-tight">
          <p className="text-xs font-semibold text-gray-900">
            Réservation confirmée
          </p>
          <p className="text-[11px] text-gray-500">Box braids · sam. 14 h</p>
        </div>
      </FloatingCard>

      <FloatingCard className="right-0 top-1/2 sm:-right-24" delay={1.1}>
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#F6E7C8] text-[#B8832A]">
          <Star className="size-4 fill-current" />
        </span>
        <div className="text-left leading-tight">
          <p className="text-xs font-semibold text-gray-900">Nouvel avis</p>
          <p className="text-[11px] text-gray-500">★★★★★ « Parfait ! »</p>
        </div>
      </FloatingCard>

      <FloatingCard className="left-0 bottom-16 sm:-left-20" delay={1.4}>
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BellRing className="size-4" />
        </span>
        <div className="text-left leading-tight">
          <p className="text-xs font-semibold text-gray-900">Rappel envoyé</p>
          <p className="text-[11px] text-gray-500">SMS 24 h avant</p>
        </div>
      </FloatingCard>
    </div>
  );
}
