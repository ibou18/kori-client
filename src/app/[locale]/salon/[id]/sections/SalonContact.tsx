"use client";

import { ExternalLink, Globe, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { useSalonTheme } from "../theme/SalonThemeProvider";
import type { PublicSalon } from "../types";
import { SalonSectionHeading } from "./SalonSectionHeading";

/** Coordonnées du salon + lien vers l'itinéraire. */
export function SalonContact({ salon, isEn }: { salon: PublicSalon; isEn: boolean }) {
  const theme = useSalonTheme();
  const a = salon.address;
  const line1 = a?.street?.trim();
  const line2 = a ? [a.city, a.province, a.postalCode].filter(Boolean).join(", ") : "";
  const mapsQuery = a
    ? encodeURIComponent([a.street, a.city, a.postalCode, a.country].filter(Boolean).join(", "))
    : "";
  const website = salon.website?.trim();
  const websiteHref = website && !/^https?:\/\//i.test(website) ? `https://${website}` : website;

  if (!line1 && !salon.phone && !salon.email && !website) return null;

  const Item = ({
    icon,
    label,
    children,
  }: {
    icon: ReactNode;
    label: string;
    children: ReactNode;
  }) => (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl"
        style={{ background: `${theme.primaryColor}1F`, color: theme.primaryColor }}
      >
        {icon}
      </span>
      <div className="min-w-0 text-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
        <div className="break-words text-slate-800">{children}</div>
      </div>
    </div>
  );

  return (
    <section id="contact" className="scroll-mt-28 border-t border-black/[0.06] py-10">
      <SalonSectionHeading eyebrow={isEn ? "Find us" : "Nous trouver"} title="Contact" />
      <div className="grid gap-5 sm:grid-cols-2">
        {line1 && (
          <Item icon={<MapPin className="size-4" />} label={isEn ? "Address" : "Adresse"}>
            <p>{line1}</p>
            {line2 && <p>{line2}</p>}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors hover:bg-white"
              style={{ borderColor: `${theme.primaryColor}59`, color: theme.primaryColor }}
            >
              {isEn ? "Directions" : "Itinéraire"} <ExternalLink className="size-3" />
            </a>
          </Item>
        )}
        {salon.phone && (
          <Item icon={<Phone className="size-4" />} label={isEn ? "Phone" : "Téléphone"}>
            <a href={`tel:${salon.phone.replace(/\s/g, "")}`} className="hover:underline">
              {salon.phone}
            </a>
          </Item>
        )}
        {salon.email && (
          <Item icon={<Mail className="size-4" />} label={isEn ? "Email" : "Courriel"}>
            <a href={`mailto:${salon.email}`} className="hover:underline">
              {salon.email}
            </a>
          </Item>
        )}
        {websiteHref && (
          <Item icon={<Globe className="size-4" />} label={isEn ? "Website" : "Site web"}>
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {website!.replace(/^https?:\/\//i, "")}
            </a>
          </Item>
        )}
      </div>
    </section>
  );
}
