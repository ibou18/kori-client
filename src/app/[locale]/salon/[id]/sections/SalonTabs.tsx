"use client";

import { cn } from "@/lib/utils";

export type SalonTabKey = "prestations" | "boutique" | "avis" | "a-propos" | "galerie";

export interface SalonTab {
  key: SalonTabKey;
  label: string;
}

/**
 * Onglets du profil (maquette : Prestations · Boutique · Avis · À propos · Galerie),
 * collants sous la barre korí. Masqués s'il n'y a qu'une section à montrer.
 */
export function SalonTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: SalonTab[];
  active: SalonTabKey;
  onChange: (key: SalonTabKey) => void;
}) {
  if (tabs.length < 2) return null;
  return (
    <div
      role="tablist"
      aria-label="Sections du profil"
      className="sticky top-14 z-30 grid border-b border-site-border bg-site-bg px-2"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${tab.key}`}
            onClick={() => onChange(tab.key)}
            className={cn(
              "min-h-12 border-b-2 px-0.5 text-[13px] transition-colors md:text-sm",
              selected
                ? "border-site-accent font-semibold text-site-fg"
                : "border-transparent font-medium text-site-muted hover:text-site-fg",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
