"use client";

import { Scissors } from "lucide-react";
import { SERVICE_TAGS } from "./constants";

/** Ruban défilant des catégories de services disponibles sur korí. */
export function ServicesMarquee() {
  const items = [...SERVICE_TAGS, ...SERVICE_TAGS];
  return (
    <div
      className="relative overflow-hidden border-y border-primary/10 bg-white/60 py-4 backdrop-blur"
      aria-label="Services disponibles sur korí"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F7F1E8] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F7F1E8] to-transparent" />
      <ul className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
        {items.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="flex items-center gap-3 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.2em] text-gray-700"
            aria-hidden={i >= SERVICE_TAGS.length}
          >
            <Scissors className="size-3.5 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
