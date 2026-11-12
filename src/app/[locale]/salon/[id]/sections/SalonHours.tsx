"use client";

import { cn } from "@/lib/utils";
import type { OpeningHours } from "../types";

const DAYS: Array<{ key: keyof OpeningHours; fr: string; en: string; jsDay: number }> = [
  { key: "monday", fr: "Lundi", en: "Monday", jsDay: 1 },
  { key: "tuesday", fr: "Mardi", en: "Tuesday", jsDay: 2 },
  { key: "wednesday", fr: "Mercredi", en: "Wednesday", jsDay: 3 },
  { key: "thursday", fr: "Jeudi", en: "Thursday", jsDay: 4 },
  { key: "friday", fr: "Vendredi", en: "Friday", jsDay: 5 },
  { key: "saturday", fr: "Samedi", en: "Saturday", jsDay: 6 },
  { key: "sunday", fr: "Dimanche", en: "Sunday", jsDay: 0 },
];

/** Jour (0–6) et heure « HH:MM » courants dans le fuseau du salon. */
function nowInTimezone(timezone?: string): { day: number; hhmm: string } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || undefined,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const hour = get("hour") === "24" ? "00" : get("hour");
    return { day: dayIndex, hhmm: `${hour}:${get("minute")}` };
  } catch {
    return null;
  }
}

export function salonHasHours(openingHours?: OpeningHours): boolean {
  return !!openingHours && DAYS.some((d) => {
    const h = openingHours[d.key];
    return !!(h && h.open && h.close);
  });
}

/**
 * Carte « Heures d'ouverture » (maquette), affichée sous les onglets. Jour
 * courant en gras et couleur accent, badge « Ouvert · ferme à … » calculé dans
 * le fuseau du salon, pas celui du visiteur.
 */
export function SalonHours({
  openingHours,
  timezone,
  isEn,
  className,
}: {
  openingHours?: OpeningHours;
  timezone?: string;
  isEn: boolean;
  className?: string;
}) {
  if (!salonHasHours(openingHours)) return null;
  const hours = openingHours!;

  const now = nowInTimezone(timezone);
  const today = now ? DAYS.find((d) => d.jsDay === now.day) : undefined;
  const todayHours = today ? hours[today.key] : undefined;
  const isOpenNow =
    !!now && !!todayHours?.open && !!todayHours?.close && now.hhmm >= todayHours.open && now.hhmm < todayHours.close;

  return (
    <section className={cn("flex flex-col gap-2.5 rounded-2xl border border-site-border p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          className="font-site-display text-xl font-bold"
          style={{ textTransform: "var(--site-display-transform)" as never }}
        >
          {isEn ? "Opening hours" : "Heures d'ouverture"}
        </h2>
        {now && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              isOpenNow ? "bg-site-accent-soft text-site-fg" : "bg-site-surface text-site-muted",
            )}
          >
            <span className={cn("size-2 rounded-full", isOpenNow ? "bg-site-accent" : "bg-site-border-strong")} />
            {isOpenNow
              ? `${isEn ? "Open · closes at" : "Ouvert · ferme à"} ${todayHours!.close}`
              : isEn
                ? "Closed right now"
                : "Fermé en ce moment"}
          </span>
        )}
      </div>
      <ul className="flex flex-col">
        {DAYS.map((d, i) => {
          const h = hours[d.key];
          const open = !!(h && h.open && h.close);
          const isToday = today?.key === d.key;
          return (
            <li
              key={d.key}
              className={cn(
                "flex min-h-11 items-center justify-between gap-3 text-sm",
                i < DAYS.length - 1 && "border-b border-site-border",
                isToday ? "font-semibold text-site-accent" : open ? "text-site-fg" : "text-site-muted",
              )}
            >
              <span>{isEn ? d.en : d.fr}</span>
              <span className="tabular-nums">{open ? `${h!.open} – ${h!.close}` : isEn ? "Closed" : "Fermé"}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-[13px] text-site-muted">
        {isEn ? "Available slots are shown when you book." : "Les créneaux disponibles s'affichent au moment de réserver."}
      </p>
    </section>
  );
}
