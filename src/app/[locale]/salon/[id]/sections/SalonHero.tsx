"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { hexToRgba, mixHex, salonInitials } from "../theme/salonTheme";
import { useSalonTheme } from "../theme/SalonThemeProvider";
import { getSalonTypeLabel, type PublicSalon } from "../types";

const SLIDE_INTERVAL_MS = 5000;

/**
 * Bandeau du mini-site : diaporama des photos du salon sous un voile aux
 * couleurs de la marque, logo (ou monogramme), nom, types, note, adresse et
 * bouton Réserver. Sans photo, le voile seul fait le fond.
 */
export function SalonHero({
  salon,
  isEn,
  onBook,
}: {
  salon: PublicSalon;
  isEn: boolean;
  onBook: () => void;
}) {
  const theme = useSalonTheme();
  const reduceMotion = useReducedMotion();
  const photos = (salon.photos ?? []).filter((p) => p.url);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (photos.length <= 1 || paused || reduceMotion) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % photos.length),
      SLIDE_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [photos.length, paused, reduceMotion]);

  const current = photos[Math.min(index, Math.max(photos.length - 1, 0))];
  const initials = salonInitials(salon.name);
  const types = (salon.salonTypes ?? []).slice(0, 3).map(getSalonTypeLabel);
  const addressText = salon.address
    ? [salon.address.street, salon.address.city].filter(Boolean).join(", ")
    : "";
  const hasRating = (salon.reviewCount ?? 0) > 0 && salon.rating !== undefined;

  const veil = `linear-gradient(to top, ${mixHex(theme.primaryColor, "#000000", 0.08)} 0%, ${hexToRgba(theme.primaryColor, 0.72)} 40%, ${hexToRgba(theme.primaryColor, photos.length ? 0.05 : 0.9)} 75%), linear-gradient(115deg, ${hexToRgba(theme.secondaryColor, 0.45)}, transparent 55%)`;
  const fallbackBg = `radial-gradient(ellipse at 70% 30%, ${hexToRgba(theme.secondaryColor, 0.55)}, transparent 55%), linear-gradient(160deg, ${mixHex(theme.primaryColor, "#000000", 0.25)}, ${theme.primaryColor})`;

  return (
    <section
      aria-label={isEn ? "Salon photos" : "Photos du salon"}
      className="relative isolate -mx-4 overflow-hidden text-white sm:-mx-4 lg:-mx-8"
      style={{ minHeight: photos.length ? "min(72vh, 560px)" : "360px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Diaporama */}
      <div className="absolute inset-0 -z-20" style={{ background: fallbackBg }}>
        <AnimatePresence initial={false}>
          {current && (
            <motion.div
              key={current.id ?? index}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: 1,
                scale: reduceMotion ? 1 : 1.08,
                transition: {
                  opacity: { duration: 1.1 },
                  scale: { duration: SLIDE_INTERVAL_MS / 1000 + 1.5, ease: "linear" },
                },
              }}
              exit={{ opacity: 0, transition: { duration: 1.1 } }}
            >
              <Image
                src={current.url}
                alt={current.alt || salon.name}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: veil }} />

      {/* Points du diaporama */}
      {photos.length > 1 && (
        <div
          role="tablist"
          aria-label={isEn ? "Choose a photo" : "Choisir la photo"}
          className="absolute right-4 top-4 z-10 flex gap-1.5 sm:right-8"
        >
          {photos.map((p, i) => (
            <button
              key={p.id ?? i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Identité */}
      <div className="relative mx-auto flex h-full min-h-[inherit] w-full max-w-5xl flex-wrap items-end justify-between gap-5 px-4 pb-7 pt-24 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex min-w-0 items-end gap-4"
        >
          <div
            aria-label={isEn ? "Salon logo" : "Logo du salon"}
            className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-[22px] shadow-[0_12px_30px_-10px_rgba(0,0,0,.6)] ring-2 ring-white/60 sm:size-24"
            style={{
              background: `linear-gradient(135deg, ${theme.secondaryColor}, ${theme.primaryColor})`,
              color: theme.onSecondary,
            }}
          >
            {theme.logoUrl ? (
              <Image
                src={theme.logoUrl}
                alt={`Logo ${salon.name}`}
                width={96}
                height={96}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-site-display text-3xl font-semibold sm:text-4xl">
                {initials}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h1
              className="font-site-display text-balance font-semibold leading-[1] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,.35)]"
              style={{
                fontSize: "calc(clamp(2.1rem, 6vw, 3.6rem) * var(--site-display-scale))",
                textTransform: "var(--site-display-transform)" as never,
              }}
            >
              {salon.name}
            </h1>
            {theme.tagline && (
              <p className="mt-2 max-w-xl text-pretty text-base text-white/90 sm:text-lg">
                {theme.tagline}
              </p>
            )}
            {types.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {types.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] backdrop-blur"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/95">
              {hasRating && (
                <span className="inline-flex items-center gap-1">
                  <Star
                    className="size-4"
                    style={{ color: theme.secondaryColor, fill: theme.secondaryColor }}
                  />
                  <span className="font-semibold tabular-nums">
                    {salon.rating!.toFixed(1)}
                  </span>
                  <span className="text-white/75">
                    · {salon.reviewCount} {isEn ? "reviews" : "avis"}
                  </span>
                </span>
              )}
              {addressText && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{addressText}</span>
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={onBook}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="hidden items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold shadow-[0_14px_30px_-12px_rgba(0,0,0,.6)] sm:inline-flex"
          style={{ background: theme.secondaryColor, color: theme.onSecondary }}
        >
          <CalendarCheck className="size-5" />
          {isEn ? "Book an appointment" : "Réserver un rendez-vous"}
        </motion.button>
      </div>
    </section>
  );
}
