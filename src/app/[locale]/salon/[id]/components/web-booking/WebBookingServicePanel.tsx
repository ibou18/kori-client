"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

import {
  formatDurationMinutes,
  formatServicesCount,
  getServicesTotalDollars,
  getTotalDurationMinutes,
} from "./bookingSelection";
import { getOptionPriceDollars } from "./pricing";
import type {
  WebBookingSelectedService,
  WebBookingServiceOption,
  WebBookingServicePayload,
} from "./types";
import { WebBookingServiceInfo } from "./WebBookingServiceInfo";
import { WebBookingStepActions } from "./WebBookingStepActions";

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
  onContinue: () => void;
  continueLabel: string;
  onBack?: () => void;
  backLabel?: string;
  layoutVariant?: "modal" | "page";
}

export function WebBookingServicePanel({
  service,
  selectedOptionId,
  onSelectOption,
  selectedLines,
  additionalLines,
  onRemoveAdditional,
  onOpenAddService,
  addServiceHelp,
  onContinue,
  continueLabel,
  onBack,
  backLabel,
  layoutVariant = "modal",
}: WebBookingServicePanelProps) {
  const options: WebBookingServiceOption[] = service.options?.length
    ? service.options
    : [];

  const canContinue = !!selectedOptionId;

  if (options.length === 0) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        Ce service ne propose pas de formule réservable en ligne pour le moment.
        Utilisez l&apos;application korí.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "space-y-5 overflow-y-auto pr-1",
        layoutVariant === "page"
          ? "max-h-none pb-2"
          : "max-h-[min(70vh,520px)]",
      )}
    >
      {options.length > 1 && (
        <div>
          <Label className="text-base font-semibold">Option</Label>
          <div className="mt-2 space-y-2">
            {options.map((opt) => {
              const picked = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectOption(opt.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                    picked
                      ? "border-[#53745D] bg-[#F0F4F1]"
                      : "border-slate-200 hover:bg-[#F0F4F1]/50"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 rounded-full border-2 ${
                      picked
                        ? "border-[#53745D] bg-[#53745D]"
                        : "border-slate-300"
                    }`}
                  />
                  <div className="flex-1 flex justify-between gap-2">
                    <span className="text-sm font-medium">{opt.name}</span>
                    <span className="text-sm font-semibold text-[#53745D] tabular-nums">
                      {getOptionPriceDollars(opt).toFixed(2)} $
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {options.length === 1 && (
        <div className="rounded-xl border border-[#53745D]/20 bg-[#F0F4F1]/80 px-3 py-2 text-sm">
          <span className="font-medium">{options[0].name}</span>
          <span className="float-right font-semibold text-[#53745D] tabular-nums">
            {getOptionPriceDollars(options[0]).toFixed(2)} $
          </span>
        </div>
      )}

      <WebBookingServiceInfo
        description={service.description}
        particularities={service.particularities}
      />

      {additionalLines.length > 0 && (
        <div>
          <Label className="text-base font-semibold">Prestations ajoutées</Label>
          <ul className="mt-2 space-y-2">
            {additionalLines.map((line) => (
              <li
                key={line.service.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {line.service.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {line.option.name} ·{" "}
                    {formatDurationMinutes(line.service.duration ?? 0)} ·{" "}
                    {getOptionPriceDollars(line.option).toFixed(2)} $
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAdditional(line.service.id)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  aria-label={`Retirer ${line.service.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ajouter une prestation du même salon (4 max, enchaînées) */}
      <div>
        <button
          type="button"
          onClick={onOpenAddService}
          disabled={addServiceHelp !== null}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-[#F0F4F1]/60 disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <Plus className="h-4 w-4" />
          Ajouter une prestation
        </button>
        {addServiceHelp && (
          <p className="mt-1 text-center text-xs text-slate-500">
            {addServiceHelp}
          </p>
        )}
      </div>

      {selectedLines.length > 0 && (
        <div className="flex items-baseline justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-600">
            {formatServicesCount(selectedLines.length)} ·{" "}
            {formatDurationMinutes(getTotalDurationMinutes(selectedLines))}
          </span>
          <span className="font-semibold text-slate-900 tabular-nums">
            {getServicesTotalDollars(selectedLines).toFixed(2)} $
          </span>
        </div>
      )}

      <WebBookingStepActions onBack={onBack} backLabel={backLabel}>
        <Button
          type="button"
          className="flex-1 bg-gradient-to-r from-[#53745D] to-[#3a5a47] text-white shadow-md hover:brightness-110 disabled:opacity-50"
          disabled={!canContinue}
          onClick={onContinue}
        >
          {continueLabel}
        </Button>
      </WebBookingStepActions>
    </div>
  );
}
