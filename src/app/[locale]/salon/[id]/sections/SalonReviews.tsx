"use client";

import type { PublicReview } from "../types";

const relativeDate = (iso: string, isEn: boolean) => {
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days < 1) return isEn ? "today" : "aujourd'hui";
  if (days < 30) return isEn ? `${days} d ago` : `il y a ${days} j`;
  const months = Math.round(days / 30);
  if (months < 12) return isEn ? `${months} mo ago` : `il y a ${months} mois`;
  const years = Math.round(months / 12);
  return isEn ? `${years} y ago` : `il y a ${years} an${years > 1 ? "s" : ""}`;
};

function Stars({ value, className = "" }: { value: number; className?: string }) {
  const full = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <span role="img" aria-label={`${full} / 5`} className={`tracking-[2px] text-site-star ${className}`}>
      {"★".repeat(full)}
      <span className="text-site-border">{"★".repeat(5 - full)}</span>
    </span>
  );
}

/** Onglet Avis (maquette) : note globale en grand, puis la liste des avis vérifiés. */
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
  const shown = reviews.filter((r) => r.comment?.trim());
  const count = reviewCount ?? reviews.length;
  const average =
    rating ?? (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);

  return (
    <section className="flex flex-col gap-4 px-5 pb-8 pt-5">
      <div className="flex items-center gap-3.5 rounded-2xl bg-site-surface p-4">
        <p className="font-site-display text-[40px] font-bold leading-none tabular-nums">
          {average.toFixed(1).replace(".", isEn ? "." : ",")}
        </p>
        <div className="flex flex-col gap-0.5">
          <Stars value={average} className="text-base" />
          <p className="text-[13px] text-site-fg-2">
            {count} {isEn ? "verified reviews · korí clients" : "avis vérifiés · clientes korí"}
          </p>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-site-muted">
          {isEn ? "No written review yet." : "Pas encore de commentaire écrit."}
        </p>
      ) : (
        shown.map((r) => {
          const first = r.client?.firstName?.trim() ?? "";
          const lastInitial = r.client?.lastName?.trim()?.[0];
          const who = first ? `${first}${lastInitial ? ` ${lastInitial}.` : ""}` : isEn ? "Client" : "Client·e";
          const initial = (first[0] ?? "K").toUpperCase();
          return (
            <article key={r.id} className="flex flex-col gap-1.5 border-b border-site-border pb-4">
              <div className="flex items-center gap-2.5">
                <div
                  aria-hidden
                  className="grid size-9 place-items-center rounded-full bg-site-accent-soft text-sm font-semibold text-site-fg"
                >
                  {initial}
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm font-semibold">{who}</p>
                  <p className="text-xs text-site-muted">{relativeDate(r.createdAt, isEn)}</p>
                </div>
                <Stars value={r.rating} className="text-[13px] !tracking-[1px]" />
              </div>
              <p className="text-sm text-site-fg-2">{r.comment}</p>
            </article>
          );
        })
      )}
    </section>
  );
}
