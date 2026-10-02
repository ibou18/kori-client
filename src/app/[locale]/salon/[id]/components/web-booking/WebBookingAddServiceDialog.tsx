"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import {
  canAddService,
  formatDurationMinutes,
  formatServicesCount,
  getServicesTotalDollars,
  getTotalDurationMinutes,
  lineFromService,
  MAX_SERVICES_PER_BOOKING,
} from "./bookingSelection";
import { getOptionPriceDollars } from "./pricing";
import type {
  WebBookingSelectedService,
  WebBookingServiceOption,
  WebBookingServicePayload,
} from "./types";

interface WebBookingAddServiceDialogProps {
  open: boolean;
  onClose: () => void;
  /** Prestations du salon (déjà chargées par le flux). */
  services: WebBookingServicePayload[];
  /** Prestations déjà choisies, principale incluse. */
  selectedLines: WebBookingSelectedService[];
  onAdd: (line: WebBookingSelectedService) => void;
}

/** Prix d'appel : l'option la moins chère, réduction incluse. */
function startingPrice(service: WebBookingServicePayload): number {
  const prices = (service.options ?? []).map(getOptionPriceDollars);
  return prices.length ? Math.min(...prices) : 0;
}

/**
 * Ajout d'une prestation du même salon : choix de la prestation, puis de son
 * option, avec le total qui s'ajuste. Ne propose que les prestations
 * compatibles en lieu et pas encore choisies. Les particularités sont
 * confirmées ici même (aligné app mobile).
 */
export function WebBookingAddServiceDialog({
  open,
  onClose,
  services,
  selectedLines,
  onAdd,
}: WebBookingAddServiceDialogProps) {
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [pickedOptionId, setPickedOptionId] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const candidates = useMemo(
    () =>
      services
        .filter(
          (s) =>
            s.isActive !== false &&
            !selectedLines.some((l) => l.service.id === s.id),
        )
        .map((service) => ({
          service,
          check: canAddService(selectedLines, service),
        }))
        // Incompatibles en lieu : masquées (décision produit) ; les autres
        // refus (durée, 4 max) restent visibles mais grisés.
        .filter(
          ({ check }) => check.ok || check.reason !== "INCOMPATIBLE_LOCATION",
        ),
    [services, selectedLines],
  );

  const candidate = services.find((s) => s.id === candidateId) ?? null;
  const options: WebBookingServiceOption[] = candidate?.options ?? [];
  // Une seule option : sélectionnée d'office, comme sur le panneau principal.
  const optionId =
    pickedOptionId ?? (options.length === 1 ? options[0].id : null);
  const option = options.find((o) => o.id === optionId) ?? null;
  const particularities = candidate?.particularities?.trim() ?? "";
  const canConfirm = !!option && (!particularities || acknowledged);

  const previewLines =
    candidate && option
      ? [...selectedLines, lineFromService(candidate, option, selectedLines.length + 1)]
      : selectedLines;

  const resetSelection = () => {
    setCandidateId(null);
    setPickedOptionId(null);
    setAcknowledged(false);
  };

  const handleClose = () => {
    resetSelection();
    onClose();
  };

  const handleConfirm = () => {
    if (!candidate || !option || !canConfirm) return;
    const line = lineFromService(candidate, option, selectedLines.length + 1);
    resetSelection();
    onAdd(line);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto z-[110]">
        <DialogHeader>
          <DialogTitle className="text-left pr-8">
            Ajouter une prestation · {selectedLines.length}/
            {MAX_SERVICES_PER_BOOKING}
          </DialogTitle>
          <DialogDescription className="text-left">
            Les prestations s&apos;enchaînent dans l&apos;ordre où vous les
            choisissez, avec la même professionnelle.
          </DialogDescription>
        </DialogHeader>

        {!candidate ? (
          candidates.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center py-4">
              Aucune autre prestation compatible avec votre sélection.
            </p>
          ) : (
            <div className="space-y-2">
              {candidates.map(({ service, check }) => (
                <button
                  key={service.id}
                  type="button"
                  disabled={!check.ok}
                  onClick={() => {
                    setCandidateId(service.id);
                    setPickedOptionId(null);
                    setAcknowledged(false);
                  }}
                  className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition-colors hover:bg-[#F0F4F1]/50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {service.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDurationMinutes(service.duration ?? 0)} · à partir
                      de {startingPrice(service).toFixed(2)} $
                    </p>
                    {!check.ok && (
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        {check.reason === "MAX_DURATION"
                          ? "Dépasse la durée maximale de 8 h"
                          : check.message}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={resetSelection}
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Toutes les prestations
            </button>

            <div>
              <p className="text-base font-semibold text-slate-900">
                {candidate.name}
              </p>
              <p className="text-sm text-slate-500">Sélectionner une option</p>
            </div>

            <div className="space-y-2">
              {options.map((opt) => {
                const picked = optionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPickedOptionId(opt.id)}
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

            {particularities ? (
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-slate-800 space-y-2">
                <p className="font-semibold">Particularités du service</p>
                <p className="whitespace-pre-line max-h-[30vh] overflow-y-auto">
                  {particularities}
                </p>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-slate-900"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                  />
                  J&apos;ai lu et compris les particularités de ce service.
                </label>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900 tabular-nums">
                  {getServicesTotalDollars(previewLines).toFixed(2)} $
                </p>
                <p className="text-xs text-slate-500">
                  {formatServicesCount(previewLines.length)} ·{" "}
                  {formatDurationMinutes(getTotalDurationMinutes(previewLines))}
                </p>
              </div>
              <Button
                type="button"
                className="bg-gradient-to-r from-[#53745D] to-[#3a5a47] text-white shadow-md hover:brightness-110 disabled:opacity-50"
                disabled={!canConfirm}
                onClick={handleConfirm}
              >
                Ajouter
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
