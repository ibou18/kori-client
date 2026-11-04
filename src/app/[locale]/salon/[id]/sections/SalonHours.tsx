"use client";

import { Clock } from "lucide-react";
import { useSalonTheme } from "../theme/SalonThemeProvider";
import type { OpeningHours } from "../types";
import { SalonSectionHeading } from "./SalonSectionHeading";

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

/**
 * Horaires d'ouverture avec le jour courant surligné et un badge
 * « Ouvert · ferme à … » calculé dans le fuseau du salon, pas celui du visiteur.
 */
export function SalonHours({
  openingHours,
  timezone,
  isEn,
}: {
  openingHours?: OpeningHours;
  timezone?: string;
  isEn: boolean;
}) {
  const theme = useSalonTheme();
  if (!openingHours) return null;
  const hasAny = DAYS.some((d) => {
    const h = openingHours[d.key];
    return h && h.open && h.close;
  });
  if (!hasAny) return null;

  const now = nowInTimezone(timezone);
  const today = now ? DAYS.find((d) => d.jsDay === now.day) : undefined;
  const todayHours = today ? openingHours[today.key] : undefined;
  const isOpenNow =
    !!now &&
    !!todayHours?.open &&
    !!todayHours?.close &&
    now.hhmm >= todayHours.open &&
    now.hhmm < todayHours.close;

  return (
    <section id="horaires" className="scroll-mt-28 border-t border-black/[0.06] py-10">
      <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SalonSectionHeading
            eyebrow={isEn ? "Hours" : "Horaires"}
            title={isEn ? "When to come" : "Quand venir"}
          />
          {now && (
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
              style={{
                background: isOpenNow ? `${theme.primaryColor}1F` : "rgba(15,23,42,.06)",
                color: isOpenNow ? theme.primaryColor : "#64748b",
              }}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: isOpenNow ? theme.primaryColor : "#94a3b8" }}
              />
              {isOpenNow
                ? `${isEn ? "Open · closes at" : "Ouvert · ferme à"} ${todayHours!.close}`
                : isEn
                  ? "Closed right now"
                  : "Fermé en ce moment"}
            </span>
          )}
        </div>
        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: `${theme.primaryColor}33` }}
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Clock className="size-4" style={{ color: theme.primaryColor }} />
            {isEn ? "Opening hours" : "Horaires d'ouverture"}
          </div>
          <ul>
            {DAYS.map((d) => {
              const h = openingHours[d.key];
              const open = !!(h && h.open && h.close);
              const isToday = today?.key === d.key;
              return (
                <li
                  key={d.key}
                  className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0"
                  style={isToday ? { color: theme.primaryColor, fontWeight: 700 } : undefined}
                >
                  <span className={isToday ? "" : "font-medium text-slate-700"}>
                    {isEn ? d.en : d.fr}
                  </span>
                  <span
                    className={`tabular-nums ${
                      open ? (isToday ? "" : "font-semibold text-slate-800") : "text-slate-400"
                    }`}
                  >
                    {open ? `${h!.open} – ${h!.close}` : isEn ? "Closed" : "Fermé"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
