"use client";

import { Star } from "lucide-react";
import { useSalonTheme } from "../theme/SalonThemeProvider";
import type { PublicReview } from "../types";
import { SalonSectionHeading } from "./SalonSectionHeading";

const relativeDate = (iso: string, isEn: boolean) => {
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days < 1) return isEn ? "today" : "aujourd'hui";
  if (days < 30) return isEn ? `${days} d ago` : `il y a ${days} j`;
  const months = Math.round(days / 30);
  if (months < 12) return isEn ? `${months} mo ago` : `il y a ${months} mois`;
  const years = Math.round(months / 12);
  return isEn ? `${years} y ago` : `il y a ${years} an${years > 1 ? "s" : ""}`;
};

/** Trois derniers avis vérifiés (réservations korí). Masqué s'il n'y en a aucun. */
export function SalonReviews({
  reviews,
  rating,
  reviewCount,
  isEn,
}: {
  reviews: PublicReview[];
  rating?: number;
  reviewCount?: number;
  isEn: boolean;
}) {
  const theme = useSalonTheme();
  const shown = reviews.filter((r) => r.comment?.trim()).slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <section id="avis" className="scroll-mt-28 border-t border-black/[0.06] py-10">
      <SalonSectionHeading
        eyebrow={isEn ? "Verified reviews" : "Avis vérifiés"}
        title={isEn ? "What clients say" : "Ce que disent les clients"}
        aside={
          rating !== undefined && (reviewCount ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Star
                className="size-4"
                style={{ color: theme.secondaryColor, fill: theme.secondaryColor }}
              />
              <b className="text-slate-800">{rating.toFixed(1)}</b> · {reviewCount}{" "}
              {isEn ? "reviews" : "avis"}
            </span>
          ) : undefined
        }
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => {
          const first = r.client?.firstName?.trim() ?? "";
          const lastInitial = r.client?.lastName?.trim()?.[0];
          const who = first
            ? `${first}${lastInitial ? ` ${lastInitial}.` : ""}`
            : isEn
              ? "Client"
              : "Client·e";
          const initials = `${first[0] ?? "K"}${lastInitial ?? ""}`.toUpperCase();
          return (
            <li
              key={r.id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
              style={{ borderColor: `${theme.primaryColor}33` }}
            >
              <div className="mb-2 flex items-center gap-2.5 text-[13px]">
                <span
                  className="grid size-8 place-items-center rounded-full text-xs font-bold"
                  style={{ background: theme.primaryColor, color: theme.onPrimary }}
                >
                  {initials}
                </span>
                <span className="min-w-0">
                  <b className="text-slate-800">{who}</b>
                  <span className="text-slate-500"> · {relativeDate(r.createdAt, isEn)}</span>
                </span>
                <span
                  className="ml-auto inline-flex items-center gap-0.5"
                  aria-label={`${r.rating}/5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-3"
                      style={
                        i < Math.round(r.rating)
                          ? { color: theme.secondaryColor, fill: theme.secondaryColor }
                          : { color: "#cbd5e1" }
                      }
                    />
                  ))}
                </span>
              </div>
              <p className="line-clamp-4 text-sm leading-relaxed text-slate-700">{r.comment}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
