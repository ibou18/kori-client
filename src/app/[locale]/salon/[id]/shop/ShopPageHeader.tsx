"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

/** En-tête des pages commande (même style que le parcours de réservation, sans étapes). */
export function ShopPageHeader({ salonName, title, backHref }: { salonName: string; title: string; backHref?: string }) {
  return (
    <div className="flex shrink-0 flex-col">
      <header className="flex items-center gap-2 px-3 pb-2 pt-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Retour"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-site-surface text-site-fg transition-colors hover:bg-site-accent-soft"
          >
            <ChevronLeft className="size-5" />
          </Link>
        )}
        <p className="min-w-0 flex-1 truncate font-semibold">{salonName}</p>
      </header>
      <h1
        className="px-5 pt-3 font-site-display text-[28px] font-bold leading-[1.15] tracking-[-0.5px]"
        style={{ textTransform: "var(--site-display-transform)" as never }}
      >
        {title}
      </h1>
    </div>
  );
}

/** Coque des pages boutique : thème du salon, colonne centrée en carte sur ordinateur. */
export function ShopPageCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[640px] md:py-8">
      <div className="flex min-h-screen flex-col bg-site-bg md:min-h-0 md:overflow-hidden md:rounded-3xl md:border md:border-site-border md:shadow-[0_18px_50px_-30px_rgba(17,17,17,0.35)]">
        {children}
      </div>
    </div>
  );
}
