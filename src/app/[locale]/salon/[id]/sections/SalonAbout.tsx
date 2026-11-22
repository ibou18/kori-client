"use client";

import { ExternalLink, Globe, Home, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import type { PublicSalon } from "../types";

/**
 * Téléphone et courriel masqués pour le moment (décision produit) : le code
 * d'affichage est conservé, repasser ces drapeaux à `true` pour les réafficher.
 */
const SHOW_PHONE = false;
const SHOW_EMAIL = false;

/** Vrai si l'onglet À propos a quelque chose à afficher. */
export function salonHasAbout(salon: PublicSalon): boolean {
  return !!(
    salon.description?.trim() ||
    salon.address?.street?.trim() ||
    salon.website?.trim() ||
    salon.offersHomeService ||
    (SHOW_PHONE && salon.phone) ||
    (SHOW_EMAIL && salon.email)
  );
}

function ContactRow({ icon, href, children }: { icon: ReactNode; href?: string; children: ReactNode }) {
  const className =
    "flex min-h-12 items-center gap-2.5 border-b border-site-border text-sm text-site-fg last:border-b-0";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${className} hover:underline`}>
        <span className="text-site-fg">{icon}</span>
        <span className="min-w-0 flex-1 truncate">{children}</span>
        <ExternalLink className="size-3.5 text-site-muted" />
      </a>
    );
  }
  return (
    <div className={className}>
      <span className="text-site-fg">{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

/** Onglet À propos (maquette) : texte de présentation, puis coordonnées en carte. */
export function SalonAbout({ salon, isEn }: { salon: PublicSalon; isEn: boolean }) {
  const description = salon.description?.trim();
  const a = salon.address;
  const addressLine = a ? [a.street, a.city].filter(Boolean).join(", ") : "";
  const mapsHref = a
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [a.street, a.city, a.postalCode, a.country].filter(Boolean).join(", "),
      )}`
    : undefined;
  const website = salon.website?.trim();
  const websiteHref = website && !/^https?:\/\//i.test(website) ? `https://${website}` : website;
  const hasContact =
    !!addressLine || !!websiteHref || (SHOW_PHONE && !!salon.phone) || (SHOW_EMAIL && !!salon.email);

  return (
    <section className="flex flex-col gap-4 px-5 pb-8 pt-5">
      <h2
        className="font-site-display text-[22px] font-bold"
        style={{ textTransform: "var(--site-display-transform)" as never }}
      >
        {isEn ? "About" : "À propos"}
      </h2>
      {description && (
        <p className="max-w-[62ch] whitespace-pre-line text-sm leading-relaxed text-site-fg-2">{description}</p>
      )}
      {salon.offersHomeService && (
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-site-accent-soft px-3 py-1.5 text-xs font-semibold text-site-fg">
          <Home className="size-3.5" />
          {isEn ? "Home service available" : "Service à domicile disponible"}
        </p>
      )}
      {hasContact && (
        <div className="flex flex-col rounded-2xl border border-site-border px-4 py-1">
          {addressLine && (
            <ContactRow icon={<MapPin className="size-[18px]" />} href={mapsHref}>
              {addressLine}
            </ContactRow>
          )}
          {websiteHref && (
            <ContactRow icon={<Globe className="size-[18px]" />} href={websiteHref}>
              {website!.replace(/^https?:\/\//i, "")}
            </ContactRow>
          )}
          {SHOW_PHONE && salon.phone && (
            <ContactRow icon={<Phone className="size-[18px]" />} href={`tel:${salon.phone.replace(/\s/g, "")}`}>
              {salon.phone}
            </ContactRow>
          )}
          {SHOW_EMAIL && salon.email && (
            <ContactRow icon={<Mail className="size-[18px]" />} href={`mailto:${salon.email}`}>
              {salon.email}
            </ContactRow>
          )}
        </div>
      )}
    </section>
  );
}
