"use client";

import Image from "next/image";
import { useState } from "react";
import { ServicePhotoLightbox } from "../components/ServicePhotoLightbox";
import type { PublicSalon } from "../types";

/** Onglet Galerie (maquette) : grille 3 colonnes des photos du salon, agrandissement au clic. */
export function SalonGallery({ salon, isEn }: { salon: PublicSalon; isEn: boolean }) {
  const photos = (salon.photos ?? []).filter((p) => p.url);
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (photos.length === 0) return null;

  // La lightbox repart de la photo touchée : on la met en tête de liste.
  const ordered = [...photos.slice(startIndex), ...photos.slice(0, startIndex)];

  return (
    <section className="flex flex-col gap-3.5 px-5 pb-8 pt-5">
      <h2
        className="font-site-display text-[22px] font-bold"
        style={{ textTransform: "var(--site-display-transform)" as never }}
      >
        {isEn ? "Our work" : "Mes réalisations"}
      </h2>
      <ul className="grid grid-cols-3 gap-1 md:grid-cols-4 md:gap-2">
        {photos.map((photo, i) => (
          <li key={photo.id ?? i}>
            <button
              type="button"
              onClick={() => {
                setStartIndex(i);
                setOpen(true);
              }}
              aria-label={isEn ? `Enlarge photo ${i + 1}` : `Agrandir la photo ${i + 1}`}
              className="relative block aspect-square w-full overflow-hidden rounded-[10px] bg-site-media"
            >
              <Image
                src={photo.url}
                alt={photo.alt || `${salon.name} ${i + 1}`}
                fill
                sizes="(min-width: 768px) 25vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>
      <p className="text-[13px] text-site-muted">
        {isEn ? "Tap a photo to enlarge it." : "Touchez une photo pour l'agrandir."}
      </p>
      <ServicePhotoLightbox open={open} onClose={() => setOpen(false)} photos={ordered} title={salon.name} isEn={isEn} />
    </section>
  );
}
