"use client";

import Image from "next/image";
import { useSalonTheme } from "../theme/SalonThemeProvider";
import type { PublicSalon } from "../types";
import { SalonSectionHeading } from "./SalonSectionHeading";

/** À propos + galerie (photos du salon, à partir de deux). */
export function SalonAbout({ salon, isEn }: { salon: PublicSalon; isEn: boolean }) {
  const theme = useSalonTheme();
  const description = salon.description?.trim();
  const gallery = (salon.photos ?? []).filter((p) => p.url).slice(0, 8);
  const hasGallery = gallery.length >= 2;
  if (!description && !hasGallery) return null;

  return (
    <section id="a-propos" className="scroll-mt-28 border-t border-black/[0.06] py-10">
      <div className={`grid gap-8 ${hasGallery && description ? "md:grid-cols-[1.1fr_0.9fr]" : ""}`}>
        {description && (
          <div>
            <SalonSectionHeading
              eyebrow={isEn ? "The salon" : "Le salon"}
              title={isEn ? "About" : "À propos"}
            />
            <div className="max-w-[62ch] whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
              {description}
            </div>
            {salon.offersHomeService && (
              <p
                className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{ background: `${theme.primaryColor}1F`, color: theme.primaryColor }}
              >
                {isEn ? "Home service available" : "Service à domicile disponible"}
              </p>
            )}
          </div>
        )}
        {hasGallery && (
          <div id="galerie" className="scroll-mt-28">
            {!description && (
              <SalonSectionHeading eyebrow="Photos" title={isEn ? "Gallery" : "Galerie"} />
            )}
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-2">
              {gallery.map((photo, i) => (
                <li
                  key={photo.id ?? i}
                  className={`relative overflow-hidden rounded-2xl bg-slate-100 ${
                    i === 0 && gallery.length >= 3
                      ? "col-span-2 aspect-[2/1] sm:col-span-3 md:col-span-2"
                      : "aspect-square"
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt || `${salon.name} ${i + 1}`}
                    fill
                    sizes="(min-width: 768px) 30vw, 50vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
