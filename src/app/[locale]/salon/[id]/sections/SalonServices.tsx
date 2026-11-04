"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ServicePhotoLightbox } from "../components/ServicePhotoLightbox";
import {
  formatSalonPriceDollars,
  getServiceDurationMinutes,
} from "../components/web-booking/pricing";
import { useSalonTheme } from "../theme/SalonThemeProvider";
import type { PublicService } from "../types";
import { SalonSectionHeading } from "./SalonSectionHeading";

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
};

/**
 * Liste des prestations : filtres par catégorie, cartes avec options et prix,
 * vignette agrandissable. Comportement repris de l'ancienne page, thémé.
 */
export function SalonServices({
  services,
  isEn,
  onBookService,
}: {
  services: PublicService[];
  isEn: boolean;
  onBookService: (service: PublicService) => void;
}) {
  const theme = useSalonTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  // Service gardé après la fermeture pour que l'animation de sortie
  // affiche encore la photo.
  const [lightboxService, setLightboxService] = useState<PublicService | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const categories = useMemo(
    () =>
      Array.from(
        new Map(
          services.filter((s) => s.category).map((s) => [s.category!.id, s.category!]),
        ).values(),
      ),
    [services],
  );

  const visible = services.filter(
    (s) => !selectedCategoryId || s.categoryId === selectedCategoryId,
  );

  const openLightbox = (service: PublicService) => {
    setLightboxService(service);
    setLightboxOpen(true);
  };

  if (services.length === 0) return null;

  return (
    <section id="services" className="scroll-mt-28 py-10">
      <SalonSectionHeading
        eyebrow={isEn ? "Services" : "Prestations"}
        title={isEn ? "Our services" : "Nos services"}
        aside={
          <span className="tabular-nums">
            {services.length} {isEn ? "services" : "prestations"}
            {categories.length > 1 &&
              ` · ${categories.length} ${isEn ? "categories" : "catégories"}`}
          </span>
        }
      />

      {categories.length > 1 && (
        <div className="scrollbar-hide -mx-4 mb-4 overflow-x-auto px-4 pb-2">
          <div className="flex min-w-max gap-2">
            {[{ id: null as string | null, name: isEn ? "All" : "Tous" }, ...categories].map(
              (category) => {
                const isActive = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id ?? "all"}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "shadow-md"
                        : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white"
                    }`}
                    style={
                      isActive
                        ? {
                            background: theme.primaryColor,
                            borderColor: theme.primaryColor,
                            color: theme.onPrimary,
                          }
                        : undefined
                    }
                  >
                    {category.name}
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((service) => {
          const opts = service.options ?? [];
          const effective = (o: (typeof opts)[number]) => o.discountPrice ?? o.price;
          const minPrice = opts.length ? Math.min(...opts.map(effective)) : null;
          const maxPrice = opts.length ? Math.max(...opts.map(effective)) : null;
          const subtitle = service.particularities?.trim() || service.description?.trim();
          return (
            <motion.button
              key={service.id}
              type="button"
              onClick={() => onBookService(service)}
              className="flex w-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:shadow-lg"
              style={{ borderColor: `${theme.primaryColor}33` }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex min-h-0 flex-1 items-start gap-3 p-3.5">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-900">
                    {service.name}
                  </p>
                  {subtitle ? (
                    <p className="line-clamp-2 text-xs text-slate-500">{subtitle}</p>
                  ) : null}
                  {service.duration ? (
                    <p className="text-xs text-slate-500">
                      {formatDuration(getServiceDurationMinutes(service.duration))}
                    </p>
                  ) : null}
                  {opts.length > 0 && minPrice !== null && maxPrice !== null ? (
                    <>
                      <p className="mt-1 text-sm font-bold tabular-nums text-slate-900">
                        {minPrice === maxPrice
                          ? `${formatSalonPriceDollars(minPrice)} $`
                          : `${formatSalonPriceDollars(minPrice)} $ – ${formatSalonPriceDollars(maxPrice)} $`}
                      </p>
                      {opts.length > 1 && (
                        <ul className="mt-1.5 max-h-[5.5rem] space-y-0.5 overflow-y-auto pr-0.5">
                          {opts.map((o, i) => {
                            const final = effective(o);
                            const hasDiscount =
                              o.discountPrice != null && o.discountPrice < o.price;
                            const label = o.name?.trim() || `Option ${i + 1}`;
                            return (
                              <li
                                key={o.id}
                                className="flex justify-between gap-2 text-[11px] leading-tight"
                              >
                                <span className="min-w-0 truncate text-slate-500">{label}</span>
                                <span className="flex shrink-0 items-center gap-1 tabular-nums">
                                  {hasDiscount ? (
                                    <span className="text-slate-400 line-through">
                                      {formatSalonPriceDollars(o.price)} $
                                    </span>
                                  ) : null}
                                  <span
                                    className={
                                      hasDiscount
                                        ? "font-semibold text-red-600"
                                        : "font-semibold text-slate-900"
                                    }
                                  >
                                    {formatSalonPriceDollars(final)} $
                                  </span>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : null}
                </div>

                {service.photos?.[0]?.url ? (
                  // La carte est déjà un <button> : la vignette ne peut pas en
                  // être un, d'où role="button".
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={
                      isEn
                        ? `Enlarge photo of ${service.name}`
                        : `Agrandir la photo de ${service.name}`
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(service);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      e.stopPropagation();
                      openLightbox(service);
                    }}
                    className="relative size-[4.5rem] shrink-0 cursor-zoom-in overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus-visible:ring-2 sm:size-20"
                  >
                    <Image
                      src={service.photos[0].url}
                      alt={service.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden
                    className="size-[4.5rem] shrink-0 rounded-xl sm:size-20"
                    style={{
                      background: `linear-gradient(135deg, ${theme.secondaryColor}55, ${theme.primaryColor}55)`,
                    }}
                  />
                )}
              </div>
              <div
                className="mt-auto shrink-0 border-t px-3.5 pb-3.5 pt-3"
                style={{ borderColor: `${theme.primaryColor}1A` }}
              >
                <span
                  className="flex w-full items-center justify-center rounded-lg border py-2 text-sm font-semibold"
                  style={{
                    borderColor: `${theme.primaryColor}59`,
                    background: `${theme.primaryColor}0F`,
                    color: theme.primaryColor,
                  }}
                >
                  {isEn ? "Book" : "Réserver"}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <ServicePhotoLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photos={lightboxService?.photos?.filter((photo) => photo.url) ?? []}
        title={lightboxService?.name ?? ""}
        isEn={isEn}
      />
    </section>
  );
}
