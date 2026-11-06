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
 * Facteur de taille du nom selon sa longueur : un nom long rétrécit par paliers
 * pour tenir sur deux lignes au plus à côté du logo, même sur téléphone.
 */
function nameScale(name: string | null | undefined): number {
  const length = (name ?? "").trim().length;
  if (length <= 18) return 1;
  if (length <= 28) return 0.9;
  if (length <= 40) return 0.82;
  return 0.75;
}

/**
 * En-tête du mini-site : un bandeau photo court (diaporama, sans texte dessus),
 * puis l'identité du salon sur fond blanc — logo (ou monogramme) à cheval sur le
 * bandeau, nom, types, note, adresse et bouton Réserver. Sans photo, le bandeau
 * devient une simple bande aux couleurs de la marque.
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

  // Fond du bandeau : visible sans photo, et pendant le chargement d'une photo.
  const bannerBg = `radial-gradient(ellipse at 70% 30%, ${hexToRgba(theme.secondaryColor, 0.55)}, transparent 55%), linear-gradient(160deg, ${mixHex(theme.primaryColor, "#000000", 0.25)}, ${theme.primaryColor})`;

  return (
    <header className="-mx-4 lg:-mx-8">
      {/* Bandeau photo */}
      <div
        role="group"
        aria-label={isEn ? "Salon photos" : "Photos du salon"}
        className={`relative isolate overflow-hidden ${
          photos.length
            ? "h-[clamp(180px,30vh,250px)] sm:h-[clamp(220px,38vh,340px)]"
            : "h-[clamp(96px,14vh,130px)] sm:h-[clamp(112px,16vh,150px)]"
        }`}
        style={{ background: bannerBg }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
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

        {/* Points du diaporama (pastille sombre : lisibles sur photo claire) */}
        {photos.length > 1 && (
          <div
            role="tablist"
            aria-label={isEn ? "Choose a photo" : "Choisir la photo"}
            className="absolute right-4 top-4 z-10 flex gap-1.5 rounded-full bg-black/30 px-2.5 py-2 backdrop-blur-sm sm:right-8"
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
                  i === index ? "w-6 bg-white" : "w-2 bg-white/55 hover:bg-white/85"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Identité */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-x-6 px-4 pb-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3.5 gap-y-2.5 sm:gap-x-4 sm:gap-y-2"
        >
          <div
            aria-label={isEn ? "Salon logo" : "Logo du salon"}
            className="relative -mt-9 grid size-[4.5rem] shrink-0 place-items-center overflow-hidden rounded-[20px] shadow-[0_10px_24px_-12px_rgba(0,0,0,.45)] ring-4 ring-white sm:-mt-11 sm:size-[5.5rem]"
            style={{
              background: `linear-gradient(135deg, ${theme.secondaryColor}, ${theme.primaryColor})`,
              color: theme.onSecondary,
            }}
          >
            {theme.logoUrl ? (
              <Image
                src={theme.logoUrl}
                alt={`Logo ${salon.name}`}
                width={88}
                height={88}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-site-display text-2xl font-semibold sm:text-3xl">
                {initials}
              </span>
            )}
          </div>

          <h1
            title={salon.name}
            className="line-clamp-2 min-w-0 break-words pt-3 font-site-display text-balance font-semibold leading-[1.15] tracking-tight text-slate-900"
            style={{
              fontSize: `calc(clamp(1.3rem, 3vw, 1.9rem) * var(--site-display-scale) * ${nameScale(salon.name)})`,
              textTransform: "var(--site-display-transform)" as never,
            }}
          >
            {salon.name}
          </h1>

          {/* Téléphone : pleine largeur sous le logo. Dès `sm` : sous le nom, à droite du logo. */}
          <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2">
            {theme.tagline && (
              <p className="mb-2 max-w-xl text-pretty text-sm text-slate-600 sm:text-[15px]">
                {theme.tagline}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-600">
              {types.map((t) => (
                <span
                  key={t}
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ background: `${theme.primaryColor}1F`, color: theme.primaryColor }}
                >
                  {t}
                </span>
              ))}
              {hasRating && (
                <span className="inline-flex items-center gap-1">
                  <Star
                    className="size-4"
                    style={{ color: theme.secondaryColor, fill: theme.secondaryColor }}
                  />
                  <span className="font-semibold tabular-nums text-slate-900">
                    {salon.rating!.toFixed(1)}
                  </span>
                  <span className="text-slate-500">
                    · {salon.reviewCount} {isEn ? "reviews" : "avis"}
                  </span>
                </span>
              )}
              {addressText && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="size-4 shrink-0 text-slate-400" />
                  <span className="truncate">{addressText}</span>
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={onBook}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="mt-3 hidden shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-[0_10px_22px_-12px_rgba(0,0,0,.45)] sm:inline-flex"
          style={{ background: theme.secondaryColor, color: theme.onSecondary }}
        >
          <CalendarCheck className="size-[18px]" />
          {isEn ? "Book an appointment" : "Réserver un rendez-vous"}
        </motion.button>
      </div>
    </header>
  );
}
