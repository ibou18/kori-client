"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
        {visible.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isEn={isEn}
            onBook={() => onBookService(service)}
            onOpenPhoto={() => openLightbox(service)}
          />
        ))}
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

/**
 * Carte prestation. Repliée : photo, nom, durée, fourchette de prix, bouton
 * Réserver. Dépliée (chevron) : description et détail des options avec
 * prix barrés. La photo s'agrandit toujours au clic (lightbox).
 */
function ServiceCard({
  service,
  isEn,
  onBook,
  onOpenPhoto,
}: {
  service: PublicService;
  isEn: boolean;
  onBook: () => void;
  onOpenPhoto: () => void;
}) {
  const theme = useSalonTheme();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const opts = service.options ?? [];
  const effective = (o: (typeof opts)[number]) => o.discountPrice ?? o.price;
  const minPrice = opts.length ? Math.min(...opts.map(effective)) : null;
  const maxPrice = opts.length ? Math.max(...opts.map(effective)) : null;
  const hasDiscount = opts.some((o) => o.discountPrice != null && o.discountPrice < o.price);
  const description = service.description?.trim();
  const particularities = service.particularities?.trim();
  const hasDetails = !!description || !!particularities || opts.length > 1;
  const detailsId = `service-details-${service.id}`;

  return (
    <article
      className="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-lg"
      style={{ borderColor: `${theme.primaryColor}33` }}
    >
      <div className="flex items-start gap-3 p-3.5">
        {/* Photo : agrandissement au clic */}
        {service.photos?.[0]?.url ? (
          <button
            type="button"
            aria-label={
              isEn ? `Enlarge photo of ${service.name}` : `Agrandir la photo de ${service.name}`
            }
            onClick={onOpenPhoto}
            className="relative size-[4.5rem] shrink-0 cursor-zoom-in overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus-visible:ring-2 sm:size-20"
          >
            <Image
              src={service.photos[0].url}
              alt={service.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ) : (
          <div
            aria-hidden
            className="size-[4.5rem] shrink-0 rounded-xl sm:size-20"
            style={{
              background: `linear-gradient(135deg, ${theme.secondaryColor}55, ${theme.primaryColor}55)`,
            }}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-900">
            {service.name}
          </p>
          {service.duration ? (
            <p className="text-xs text-slate-500">
              {formatDuration(getServiceDurationMinutes(service.duration))}
            </p>
          ) : null}
          {minPrice !== null && maxPrice !== null ? (
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm font-bold tabular-nums text-slate-900">
              {minPrice === maxPrice
                ? `${formatSalonPriceDollars(minPrice)} $`
                : `${formatSalonPriceDollars(minPrice)} $ – ${formatSalonPriceDollars(maxPrice)} $`}
              {hasDiscount && (
                <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                  {isEn ? "Promo" : "Promo"}
                </span>
              )}
            </p>
          ) : null}
        </div>

        {hasDetails && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            aria-label={open ? (isEn ? "Hide details" : "Masquer les détails") : (isEn ? "Show details" : "Voir les détails")}
            onClick={() => setOpen((v) => !v)}
            className="grid size-8 shrink-0 place-items-center rounded-full border transition-colors hover:bg-slate-50"
            style={{ borderColor: `${theme.primaryColor}40`, color: theme.primaryColor }}
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="grid place-items-center"
            >
              <ChevronDown className="size-4" />
            </motion.span>
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && hasDetails && (
          <motion.div
            id={detailsId}
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="mx-3.5 space-y-3 border-t pb-3.5 pt-3 text-sm"
              style={{ borderColor: `${theme.primaryColor}1A` }}
            >
              {particularities && (
                <p
                  className="rounded-lg px-3 py-2 text-[13px] leading-snug"
                  style={{ background: `${theme.secondaryColor}26`, color: "#334155" }}
                >
                  {particularities}
                </p>
              )}
              {description && (
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-600">
                  {description}
                </p>
              )}
              {opts.length > 1 && (
                <ul className="space-y-1">
                  {opts.map((o, i) => {
                    const final = effective(o);
                    const discounted = o.discountPrice != null && o.discountPrice < o.price;
                    return (
                      <li key={o.id} className="flex items-baseline justify-between gap-3 text-[13px]">
                        <span className="min-w-0 truncate text-slate-600">
                          {o.name?.trim() || `Option ${i + 1}`}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 tabular-nums">
                          {discounted && (
                            <span className="text-slate-400 line-through">
                              {formatSalonPriceDollars(o.price)} $
                            </span>
                          )}
                          <span className={discounted ? "font-semibold text-red-600" : "font-semibold text-slate-900"}>
                            {formatSalonPriceDollars(final)} $
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto px-3.5 pb-3.5">
        <button
          type="button"
          onClick={onBook}
          className="flex w-full items-center justify-center rounded-lg border py-2 text-sm font-semibold transition-colors hover:brightness-95"
          style={{
            borderColor: `${theme.primaryColor}59`,
            background: `${theme.primaryColor}0F`,
            color: theme.primaryColor,
          }}
        >
          {isEn ? "Book" : "Réserver"}
        </button>
      </div>
    </article>
  );
}
