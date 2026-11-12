"use client";

import { ChevronDown, Clock } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ServicePhotoLightbox } from "../components/ServicePhotoLightbox";
import { formatSalonPriceDollars, getServiceDurationMinutes } from "../components/web-booking/pricing";
import type { PublicService } from "../types";

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
};

const price = (v: number) => `${formatSalonPriceDollars(v)} $`;

/**
 * Onglet Prestations (maquette) : pastilles de catégories, puis une liste par
 * catégorie. Chaque ligne : vignette, nom, description sur deux lignes, durée et
 * prix, bouton « Réserver ». Une prestation à plusieurs formules déplie ses prix.
 */
export function SalonServices({
  services,
  isEn,
  onBookService,
  disabled = false,
}: {
  services: PublicService[];
  isEn: boolean;
  onBookService: (service: PublicService) => void;
  /** Mode aperçu : les boutons restent visibles mais inertes. */
  disabled?: boolean;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [lightboxService, setLightboxService] = useState<PublicService | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const categories = useMemo(
    () =>
      Array.from(
        new Map(services.filter((s) => s.category).map((s) => [s.category!.id, s.category!])).values(),
      ),
    [services],
  );

  const groups = useMemo(() => {
    const visible = services.filter((s) => !selectedCategoryId || s.categoryId === selectedCategoryId);
    const byCat = new Map<string, { name: string; items: PublicService[] }>();
    for (const s of visible) {
      const key = s.category?.id ?? "__none";
      const name = s.category?.name ?? (isEn ? "Other services" : "Autres prestations");
      if (!byCat.has(key)) byCat.set(key, { name, items: [] });
      byCat.get(key)!.items.push(s);
    }
    return Array.from(byCat.entries());
  }, [services, selectedCategoryId, isEn]);

  if (services.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-site-muted">
        {isEn ? "No service bookable online yet." : "Aucune prestation réservable en ligne pour le moment."}
      </p>
    );
  }

  return (
    <>
      {categories.length > 1 && (
        <nav
          aria-label={isEn ? "Categories" : "Catégories"}
          className="scrollbar-hide flex gap-2 overflow-x-auto px-5 pb-1 pt-4"
        >
          {[{ id: null as string | null, name: isEn ? "All" : "Tout" }, ...categories].map((category) => {
            const active = selectedCategoryId === category.id;
            return (
              <button
                key={category.id ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCategoryId(category.id)}
                className={cn(
                  "flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm transition-colors",
                  active
                    ? "bg-site-accent font-semibold text-site-on-accent"
                    : "border border-site-chip-border font-medium text-site-fg hover:bg-site-surface",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col gap-7 px-5 pb-8 pt-4">
        <h2
          className="font-site-display text-2xl font-bold tracking-[-0.3px]"
          style={{ textTransform: "var(--site-display-transform)" as never }}
        >
          {isEn ? "Services" : "Prestations"}
        </h2>
        {groups.map(([key, group]) => (
          <section key={key} className="flex flex-col">
            {(groups.length > 1 || categories.length > 0) && (
              <h3 className="mb-1 text-[13px] font-semibold uppercase tracking-[1px] text-site-muted">{group.name}</h3>
            )}
            {group.items.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                isEn={isEn}
                disabled={disabled}
                onBook={() => onBookService(service)}
                onOpenPhoto={() => {
                  setLightboxService(service);
                  setLightboxOpen(true);
                }}
              />
            ))}
          </section>
        ))}
      </div>

      <ServicePhotoLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photos={lightboxService?.photos?.filter((photo) => photo.url) ?? []}
        title={lightboxService?.name ?? ""}
        isEn={isEn}
      />
    </>
  );
}

function ServiceRow({
  service,
  isEn,
  disabled,
  onBook,
  onOpenPhoto,
}: {
  service: PublicService;
  isEn: boolean;
  disabled: boolean;
  onBook: () => void;
  onOpenPhoto: () => void;
}) {
  const [open, setOpen] = useState(false);
  const opts = service.options ?? [];
  const effective = (o: (typeof opts)[number]) => o.discountPrice ?? o.price;
  const prices = opts.map(effective);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const hasSizes = opts.length > 1;
  const single = opts.length === 1 ? opts[0] : null;
  const singleDiscounted = !!single && single.discountPrice != null && single.discountPrice < single.price;
  const duration = service.duration ? formatDuration(getServiceDurationMinutes(service.duration)) : null;
  const description = service.description?.trim();
  const photo = service.photos?.find((p) => p.url);
  const detailsId = `service-sizes-${service.id}`;

  return (
    <div className="flex items-center gap-3.5 border-b border-site-border py-3.5">
      {photo ? (
        <button
          type="button"
          onClick={onOpenPhoto}
          aria-label={isEn ? `Enlarge photo of ${service.name}` : `Agrandir la photo de ${service.name}`}
          className="relative size-16 shrink-0 cursor-zoom-in overflow-hidden rounded-xl bg-site-media"
        >
          <Image src={photo.url} alt="" fill sizes="64px" className="object-cover" />
        </button>
      ) : (
        <div aria-hidden className="size-16 shrink-0 rounded-xl bg-site-media" />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <p className="text-[15px] font-semibold uppercase leading-[1.3] tracking-[0.2px]">{service.name}</p>
        {description && (
          <p className="line-clamp-2 text-[13px] leading-[1.4] text-site-muted">{description}</p>
        )}
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-site-muted">
          {duration && (
            <>
              <Clock className="size-3.5" />
              {duration}
              <span>·</span>
            </>
          )}
          {single ? (
            <>
              {singleDiscounted && <s>{price(single.price)}</s>}
              <strong className="text-sm text-site-fg">{price(effective(single))}</strong>
            </>
          ) : minPrice !== null ? (
            <strong className="text-sm text-site-fg">
              {isEn ? "from" : "dès"} {price(minPrice)}
            </strong>
          ) : null}
        </p>
        {hasSizes && open && (
          <ul id={detailsId} aria-label={isEn ? "Prices by option" : "Prix selon la formule"} className="mt-0.5 flex flex-col">
            {opts.map((o, i) => {
              const discounted = o.discountPrice != null && o.discountPrice < o.price;
              return (
                <li key={o.id} className="flex min-h-[26px] items-center gap-2 border-t border-site-border text-[13px]">
                  <span className="flex-1 truncate">{o.name?.trim() || `Option ${i + 1}`}</span>
                  {discounted && <s className="text-site-muted">{price(o.price)}</s>}
                  <span className="font-semibold tabular-nums">{price(effective(o))}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={cn("flex shrink-0 flex-col items-center gap-0.5", hasSizes && open && "self-start")}>
        <button
          type="button"
          onClick={onBook}
          aria-disabled={disabled}
          aria-label={isEn ? `Book ${service.name}` : `Réserver ${service.name}`}
          className="flex h-9 items-center justify-center rounded-full border border-site-accent bg-site-bg px-3 text-[13px] font-semibold text-site-accent transition-colors hover:bg-site-accent hover:text-site-on-accent"
        >
          {isEn ? "Book" : "Réserver"}
        </button>
        {hasSizes && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={detailsId}
            className="flex min-h-8 items-center gap-0.5 px-1 text-xs font-semibold text-site-fg-2"
          >
            {open ? (isEn ? "Hide" : "Masquer") : isEn ? "Prices" : "Prix"}
            <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  );
}
