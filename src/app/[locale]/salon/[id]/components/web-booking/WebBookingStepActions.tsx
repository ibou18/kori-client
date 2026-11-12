"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Récapitulatif affiché au-dessus du bouton principal (ex. « Tresses · 5 h » / « 180 $ »). */
export interface WebBookingFooterSummary {
  label: string;
  price: string;
}

interface WebBookingStepActionsProps {
  summary?: WebBookingFooterSummary | null;
  /** Bouton principal (généralement un `WebBookingCta`). */
  children?: ReactNode;
  /** Lien ou bouton discret sous le principal (ex. « Passer cette étape »). */
  secondary?: ReactNode;
  className?: string;
}

/**
 * Barre d'action collée en bas de l'écran (maquette KAN-16) : récapitulatif,
 * bouton principal pleine largeur en pilule, action secondaire, mention korí.
 * Le retour se fait depuis l'en-tête, plus ici.
 */
export function WebBookingStepActions({ summary, children, secondary, className }: WebBookingStepActionsProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 mt-auto flex flex-col gap-2.5 border-t border-site-border bg-site-bg px-5 pb-6 pt-3 md:rounded-b-3xl",
        className,
      )}
    >
      {summary && (
        <div className="flex items-baseline justify-between gap-3 text-sm text-site-fg-2">
          <span className="min-w-0 truncate">{summary.label}</span>
          <span className="shrink-0 text-lg font-bold tabular-nums text-site-fg">{summary.price}</span>
        </div>
      )}
      {children}
      {secondary}
      <p className="text-center text-xs text-site-muted">
        Propulsé par <strong className="font-site-display text-site-fg">korí</strong>
      </p>
    </div>
  );
}

/** Bouton principal du parcours : pilule 52 px aux couleurs du salon. */
export function WebBookingCta({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-site-accent text-base font-semibold text-site-on-accent transition-[filter,background-color] hover:brightness-110 disabled:cursor-not-allowed disabled:bg-site-border disabled:text-site-muted disabled:hover:brightness-100",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Action secondaire sous le bouton principal (texte seul, zone tactile 44 px). */
export function WebBookingSecondaryAction({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "flex min-h-11 w-full items-center justify-center text-sm font-semibold text-site-fg-2 hover:underline",
        className,
      )}
    >
      {children}
    </button>
  );
}
