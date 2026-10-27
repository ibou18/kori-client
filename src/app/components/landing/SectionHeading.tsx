"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, viewportOnce } from "./animations";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
}

/** En-tête de section animé (badge, titre, description). */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className,
}: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <motion.div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
      variants={staggerContainer(0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      <motion.span
        variants={fadeInUp}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
          dark
            ? "border-white/20 bg-white/10 text-white/80"
            : "border-primary/20 bg-primary/5 text-primary"
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            dark ? "bg-[#D9A441]" : "bg-primary"
          )}
        />
        {eyebrow}
      </motion.span>
      <motion.h2
        variants={fadeInUp}
        className={cn(
          "mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl",
          dark ? "text-white" : "text-gray-900"
        )}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={fadeInUp}
          className={cn(
            "mt-4 text-pretty text-lg",
            dark ? "text-white/70" : "text-gray-600"
          )}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
