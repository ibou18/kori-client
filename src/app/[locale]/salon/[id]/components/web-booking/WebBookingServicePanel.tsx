"use client";

import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react";

import {
  formatDurationMinutes,
  getServicesTotalDollars,
  getTotalDurationMinutes,
} from "./bookingSelection";
import { formatSalonPriceDollars, getOptionPriceDollars } from "./pricing";
import type {
  WebBookingSelectedService,
  WebBookingServiceOption,
  WebBookingServicePayload,
} from "./types";
import { WebBookingServiceInfo } from "./WebBookingServiceInfo";
import { WebBookingCta, WebBookingStepActions, type WebBookingFooterSummary } from "./WebBookingStepActions";

interface WebBookingServicePanelProps {
  service: WebBookingServicePayload;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  /** Toutes les prestations choisies (principale incluse), dans l'ordre. */
  selectedLines: WebBookingSelectedService[];
  /** Prestations ajoutées à la principale (2e à 4e). */
  additionalLines: WebBookingSelectedService[];
  onRemoveAdditional: (serviceId: string) => void;
  onOpenAddService: () => void;
  /** Motif d'indisponibilité du bouton « Ajouter », `null` si possible. */
  addServiceHelp: string | null;
  /** Conditions du service (particularités) à accepter avant de continuer. */
  conditionsAccepted: boolean;
  onConditionsAcceptedChange: (value: boolean) => void;
  onContinue: () => void;
  continueLabel: string;
  summary: WebBookingFooterSummary | null;
}

const price = (v: number) => `${formatSalonPriceDollars(v)} $`;

/** Lignes des conditions : une par ligne non vide du texte « particularités ». */
function splitConditions(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

/**
 * Étape 1 (maquette) : carte récapitulative de la sélection, ajout d'une
 * prestation, choix de la formule en liste radio, conditions du service à
 * accepter. Le bouton « Suivant » vit dans la barre basse.
 */
export function WebBookingServicePanel({
  service,
  selectedOptionId,
  onSelectOption,
  selectedLines,
  additionalLines,
  onRemoveAdditional,
  onOpenAddService,
  addServiceHelp,
  conditionsAccepted,
  onConditionsAcceptedChange,
  onContinue,
  continueLabel,
  summary,
}: WebBookingServicePanelProps) {
  const options: WebBookingServiceOption[] = service.options?.length ? service.options : [];
  const conditions = splitConditions(service.particularities?.trim() ?? "");
  const hasConditions = conditions.length > 0;
  const canContinue = !!selectedOptionId && (!hasConditions || conditionsAccepted);
  const mainOption = options.find((o) => o.id === selectedOptionId) ?? null;
  const mainMeta = [
    mainOption && options.length > 1 ? mainOption.name : null,
    formatDurationMinutes(service.duration ?? 0),
    mainOption ? price(getOptionPriceDollars(mainOption)) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  if (options.length === 0) {
    return (
      <div className="px-5 py-5">
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Ce service ne propose pas de formule réservable en ligne pour le moment. Utilisez l&apos;application korí.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-5">
        {/* Récapitulatif de la sélection */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col rounded-2xl border border-site-border bg-site-surface-2 px-4 py-1">
            <div className="flex min-h-16 items-center gap-3">
              <div className="flex flex-1 flex-col">
                <p className="font-semibold">{service.name}</p>
                <p className="text-sm text-site-fg-2">{mainMeta || "Choisissez une formule ci-dessous"}</p>
              </div>
            </div>
            {additionalLines.map((line) => (
              <div key={line.service.id} className="flex min-h-16 items-center gap-3 border-t border-site-border">
                <div className="flex flex-1 flex-col">
                  <p className="font-semibold">{line.service.name}</p>
                  <p className="text-sm text-site-fg-2">
                    {[line.option.name, formatDurationMinutes(line.service.duration ?? 0), price(getOptionPriceDollars(line.option))]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAdditional(line.service.id)}
                  aria-label={`Retirer ${line.service.name}`}
                  className="grid size-11 place-items-center rounded-full text-site-muted hover:bg-site-surface"
                >
                  <X className="size-[18px]" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenAddService}
            disabled={addServiceHelp !== null}
            className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-site-accent bg-site-bg text-[15px] font-semibold text-site-accent transition-colors hover:bg-site-accent-soft disabled:border-site-border-strong disabled:text-site-muted disabled:hover:bg-transparent"
          >
            <Plus className="size-[18px]" />
            Ajouter une prestation
          </button>
          {addServiceHelp && <p className="-mt-1 text-center text-xs text-site-muted">{addServiceHelp}</p>}
        </div>

        {/* Formules */}
        {options.length > 1 && (
          <fieldset className="m-0 flex flex-col border-0 p-0">
            <legend className="mb-1.5 text-[15px] font-semibold">Choisissez votre formule</legend>
            {options.map((opt) => {
              const picked = selectedOptionId === opt.id;
              const discounted = opt.discountPrice != null && opt.discountPrice < opt.price;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  onClick={() => onSelectOption(opt.id)}
                  className="flex min-h-12 items-center gap-3 border-t border-site-border py-1.5 text-left text-site-fg"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={cn("text-sm", picked ? "font-semibold" : "font-medium")}>{opt.name}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-1.5 text-sm">
                    {discounted && <s className="text-[13px] text-site-muted">{price(opt.price)}</s>}
                    <span className="font-semibold tabular-nums">{price(getOptionPriceDollars(opt))}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border-2",
                      picked ? "border-site-accent" : "border-site-border-strong",
                    )}
                  >
                    <span className={cn("size-2.5 rounded-full", picked ? "bg-site-accent" : "bg-transparent")} />
                  </span>
                </button>
              );
            })}
          </fieldset>
        )}

        <WebBookingServiceInfo description={service.description} />

        {/* Conditions du service */}
        {hasConditions && (
          <section aria-labelledby="wb-conditions-title" className="flex flex-col gap-2 rounded-2xl bg-site-surface-2 px-4 py-3.5">
            <p id="wb-conditions-title" className="text-[15px] font-semibold">
              Conditions du service
            </p>
            <ul className="flex flex-col gap-1.5">
              {conditions.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-site-fg-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-site-accent" />
                  <span className="whitespace-pre-line">{c}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              role="checkbox"
              aria-checked={conditionsAccepted}
              onClick={() => onConditionsAcceptedChange(!conditionsAccepted)}
              className="mt-1.5 flex min-h-11 items-center gap-2.5 border-t border-site-border pt-2 text-left text-site-fg"
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-[22px] shrink-0 place-items-center rounded-md border-2 text-site-on-accent",
                  conditionsAccepted ? "border-site-accent bg-site-accent" : "border-site-border-strong bg-site-bg",
                )}
              >
                {conditionsAccepted && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="text-sm font-semibold">J&apos;ai lu et j&apos;accepte les conditions de ce service</span>
            </button>
          </section>
        )}
      </div>

      <WebBookingStepActions
        summary={
          summary ??
          (selectedLines.length > 0
            ? {
                label: `${selectedLines.length > 1 ? `${selectedLines.length} prestations` : service.name} · ${formatDurationMinutes(getTotalDurationMinutes(selectedLines))}`,
                price: price(getServicesTotalDollars(selectedLines)),
              }
            : null)
        }
      >
        <WebBookingCta type="button" disabled={!canContinue} onClick={onContinue}>
          {continueLabel}
        </WebBookingCta>
        {hasConditions && !conditionsAccepted && selectedOptionId && (
          <p className="-mt-1 text-center text-xs text-site-muted">Cochez la case pour confirmer avoir lu les conditions.</p>
        )}
      </WebBookingStepActions>
    </>
  );
}
