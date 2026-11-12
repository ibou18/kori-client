"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { getWebBookingStepTitle } from "./bookingSteps";
import type { WebBookingStep } from "./types";

interface WebBookingHeaderProps {
  steps: WebBookingStep[];
  currentStep: WebBookingStep;
  salonName: string;
  /** Retour à l'étape précédente ; absent à la première étape. */
  onBack?: () => void;
  /** Lien de retour vers le profil du salon (première étape). */
  backHref?: string;
  /** Action « Passer » (étape facultative). */
  onSkip?: () => void;
  className?: string;
}

/**
 * En-tête du parcours (maquette KAN-16) : bouton retour rond, « Étape X sur N »
 * et nom du salon, barre de progression fine, puis le titre de l'étape en police
 * d'affichage du salon.
 */
export function WebBookingHeader({
  steps,
  currentStep,
  salonName,
  onBack,
  backHref,
  onSkip,
  className,
}: WebBookingHeaderProps) {
  const index = Math.max(0, steps.indexOf(currentStep));
  const total = steps.length;
  const optional = currentStep === "notes";
  const backClass =
    "grid size-11 shrink-0 place-items-center rounded-full bg-site-surface text-site-fg transition-colors hover:bg-site-accent-soft";

  return (
    <div className={cn("flex shrink-0 flex-col", className)}>
      <header className="flex items-center gap-2 px-3 pb-2 pt-3">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Retour" className={backClass}>
            <ChevronLeft className="size-5" />
          </button>
        ) : backHref ? (
          <Link href={backHref} aria-label="Retour au profil" className={backClass}>
            <ChevronLeft className="size-5" />
          </Link>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-xs text-site-muted">
            Étape {index + 1} sur {total}
            {optional ? " · facultatif" : ""}
          </p>
          <p className="truncate font-semibold">{salonName}</p>
        </div>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="flex min-h-11 items-center px-2 text-sm font-semibold text-site-fg hover:underline"
          >
            Passer
          </button>
        )}
      </header>

      <div
        role="progressbar"
        aria-label="Progression de la réservation"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        className="mx-5 flex h-1 rounded bg-site-border"
      >
        <div
          className="h-full rounded bg-site-accent transition-[width] duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <h1
        className="px-5 pt-5 font-site-display text-[28px] font-bold leading-[1.15] tracking-[-0.5px]"
        style={{ textTransform: "var(--site-display-transform)" as never }}
      >
        {getWebBookingStepTitle(currentStep)}
      </h1>
    </div>
  );
}
