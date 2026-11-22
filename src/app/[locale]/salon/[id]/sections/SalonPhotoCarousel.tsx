"use client";

import { useReducedMotion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { cn } from "@/lib/utils";

const SLIDE_INTERVAL_MS = 5000;

export interface CarouselPhoto {
  id?: string;
  url: string;
  alt?: string;
}

/**
 * Carrousel de réalisations (maquette KAN-16) : défilement natif par glissement
 * (scroll-snap), compteur « 1 / 5 », points cliquables, avance automatique
 * toutes les 5 s (pause au survol et au toucher, désactivée avec
 * `prefers-reduced-motion`). Un fondu optionnel vers la couleur de la bande
 * suivante permet au logo de chevaucher l'image.
 */
export function SalonPhotoCarousel({
  photos,
  altBase,
  className,
  fadeTo,
  dotsOffsetClass = "bottom-3",
  rounded = false,
  priority = false,
  sizes = "100vw",
  emptyLabel,
  emptyHint,
}: {
  photos: CarouselPhoto[];
  altBase: string;
  className?: string;
  /** Couleur CSS vers laquelle fondre le bas de l'image (ex. `var(--site-surface)`). */
  fadeTo?: string;
  dotsOffsetClass?: string;
  rounded?: boolean;
  priority?: boolean;
  sizes?: string;
  emptyLabel: string;
  emptyHint: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const count = photos.length;

  const scrollTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }, []);

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== index) setIndex(Math.max(0, Math.min(count - 1, next)));
  };

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;
    const id = window.setInterval(() => scrollTo((index + 1) % count), SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, index, paused, reduceMotion, scrollTo]);

  if (count === 0) {
    return (
      <div
        aria-hidden
        className={cn(
          "relative flex flex-col items-center justify-center gap-1.5 overflow-hidden bg-site-media text-site-muted",
          rounded && "rounded-[20px]",
          className,
        )}
      >
        <ImageIcon className="size-7" strokeWidth={1.5} />
        <span className="text-sm font-semibold">{emptyLabel}</span>
        <span className="text-xs">{emptyHint}</span>
        {fadeTo && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
            style={{ background: `linear-gradient(to bottom, transparent, ${fadeTo})` }}
          />
        )}
      </div>
    );
  }

  return (
    <section
      aria-roledescription="carrousel"
      aria-label={altBase}
      className={cn("relative overflow-hidden bg-site-media", rounded && "rounded-[20px]", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="scrollbar-hide flex h-full snap-x snap-mandatory overflow-x-auto"
      >
        {photos.map((p, i) => (
          <div
            key={p.id ?? i}
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${i + 1} / ${count}`}
            className="relative h-full w-full shrink-0 snap-start"
          >
            <Image
              src={p.url}
              alt={p.alt || `${altBase} ${i + 1}`}
              fill
              priority={priority && i === 0}
              sizes={sizes}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <span className="absolute right-3.5 top-3.5 rounded-full bg-[rgba(17,17,17,0.78)] px-2.5 py-1 text-xs font-semibold text-white tabular-nums">
          {index + 1} / {count}
        </span>
      )}

      {fadeTo && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{ background: `linear-gradient(to bottom, transparent, ${fadeTo})` }}
        />
      )}

      {count > 1 && (
        <div className={cn("absolute inset-x-0 flex justify-center gap-0.5", dotsOffsetClass)}>
          {photos.map((p, i) => (
            <button
              key={p.id ?? i}
              type="button"
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => scrollTo(i)}
              className="grid size-6 place-items-center"
            >
              <span
                className={cn(
                  "h-[7px] rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-all duration-200",
                  i === index ? "w-[22px] bg-site-fg" : "w-[7px] bg-white/80",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
