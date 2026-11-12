"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
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
import { formatSalonPriceDollars, getOptionPriceDollars } from "./pricing";
import type { WebBookingSelectedService, WebBookingServiceOption, WebBookingServicePayload } from "./types";
import { WebBookingCta } from "./WebBookingStepActions";

interface WebBookingAddServiceDialogProps {
  open: boolean;
  onClose: () => void;
  /** Prestations du salon (déjà chargées par le flux). */
  services: WebBookingServicePayload[];
  /** Prestations déjà choisies, principale incluse. */
  selectedLines: WebBookingSelectedService[];
  onAdd: (line: WebBookingSelectedService) => void;
}

const money = (v: number) => `${formatSalonPriceDollars(v)} $`;

/** Prix d'appel : l'option la moins chère, réduction incluse. */
function startingPrice(service: WebBookingServicePayload): number {
  const prices = (service.options ?? []).map(getOptionPriceDollars);
  return prices.length ? Math.min(...prices) : 0;
}

/**
 * Ajout d'une prestation du même salon (maquette : feuille « Ajouter une
 * prestation ») : liste du catalogue, puis choix de la formule, avec le total
 * qui s'ajuste. Ne propose que les prestations compatibles en lieu et pas
 * encore choisies. Les conditions sont confirmées ici même.
 */
export function WebBookingAddServiceDialog({ open, onClose, services, selectedLines, onAdd }: WebBookingAddServiceDialogProps) {
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [pickedOptionId, setPickedOptionId] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const candidates = useMemo(
    () =>
      services
        .filter((s) => s.isActive !== false && !selectedLines.some((l) => l.service.id === s.id))
        .map((service) => ({ service, check: canAddService(selectedLines, service) }))
        // Incompatibles en lieu : masquées (décision produit) ; les autres
        // refus (durée, 4 max) restent visibles mais grisés.
        .filter(({ check }) => check.ok || check.reason !== "INCOMPATIBLE_LOCATION"),
    [services, selectedLines],
  );

  const candidate = services.find((s) => s.id === candidateId) ?? null;
  const options: WebBookingServiceOption[] = candidate?.options ?? [];
  const optionId = pickedOptionId ?? (options.length === 1 ? options[0].id : null);
  const option = options.find((o) => o.id === optionId) ?? null;
  const particularities = candidate?.particularities?.trim() ?? "";
  const canConfirm = !!option && (!particularities || acknowledged);

  const previewLines =
    candidate && option ? [...selectedLines, lineFromService(candidate, option, selectedLines.length + 1)] : selectedLines;

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
      <DialogContent className="z-[110] max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl border-site-border bg-site-bg text-site-fg">
        <DialogHeader>
          <DialogTitle className="pr-8 text-left font-site-display text-xl font-bold">
            Ajouter une prestation · {selectedLines.length}/{MAX_SERVICES_PER_BOOKING}
          </DialogTitle>
          <DialogDescription className="text-left text-[13px] text-site-muted">
            Les prestations s&apos;enchaînent pendant le même rendez-vous, avec la même professionnelle.
          </DialogDescription>
        </DialogHeader>

        {!candidate ? (
          candidates.length === 0 ? (
            <p className="py-4 text-center text-sm italic text-site-muted">Aucune autre prestation compatible avec votre sélection.</p>
          ) : (
            <div className="flex flex-col">
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
                  className="flex items-center gap-3 border-b border-site-border py-2.5 text-left transition-colors hover:bg-site-surface disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  {service.photos?.[0]?.url ? (
                    <Image src={service.photos[0].url} alt="" width={52} height={52} className="size-[52px] shrink-0 rounded-[10px] bg-site-media object-cover" />
                  ) : (
                    <span aria-hidden className="size-[52px] shrink-0 rounded-[10px] bg-site-media" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{service.name}</p>
                    <p className="text-[13px] text-site-fg-2">
                      {formatDurationMinutes(service.duration ?? 0)} · dès {money(startingPrice(service))}
                    </p>
                    {!check.ok && (
                      <p className="mt-0.5 text-xs italic text-site-muted">
                        {check.reason === "MAX_DURATION" ? "Dépasse la durée maximale de 12 h" : check.message}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-site-muted" />
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={resetSelection}
              className="inline-flex min-h-11 items-center gap-1 self-start text-sm text-site-fg-2 hover:text-site-fg"
            >
              <ChevronLeft className="size-4" />
              Toutes les prestations
            </button>

            <div>
              <p className="text-base font-semibold">{candidate.name}</p>
              <p className="text-sm text-site-muted">Sélectionnez une formule</p>
            </div>

            <div className="flex flex-col">
              {options.map((opt) => {
                const picked = optionId === opt.id;
                const discounted = opt.discountPrice != null && opt.discountPrice < opt.price;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    onClick={() => setPickedOptionId(opt.id)}
                    className="flex min-h-12 items-center gap-3 border-t border-site-border py-1.5 text-left"
                  >
                    <span className={cn("flex-1 text-sm", picked ? "font-semibold" : "font-medium")}>{opt.name}</span>
                    <span className="flex items-baseline gap-1.5 text-sm">
                      {discounted && <s className="text-[13px] text-site-muted">{money(opt.price)}</s>}
                      <span className="font-semibold tabular-nums">{money(getOptionPriceDollars(opt))}</span>
                    </span>
                    <span
                      aria-hidden
                      className={cn("grid size-5 place-items-center rounded-full border-2", picked ? "border-site-accent" : "border-site-border-strong")}
                    >
                      <span className={cn("size-2.5 rounded-full", picked ? "bg-site-accent" : "bg-transparent")} />
                    </span>
                  </button>
                );
              })}
            </div>

            {particularities ? (
              <div className="flex flex-col gap-2 rounded-2xl bg-site-surface-2 px-4 py-3.5 text-sm">
                <p className="font-semibold">Conditions du service</p>
                <p className="max-h-[30vh] overflow-y-auto whitespace-pre-line text-site-fg-2">{particularities}</p>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={acknowledged}
                  onClick={() => setAcknowledged((v) => !v)}
                  className="flex min-h-11 items-center gap-2.5 border-t border-site-border pt-2 text-left"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-[22px] shrink-0 place-items-center rounded-md border-2 text-site-on-accent",
                      acknowledged ? "border-site-accent bg-site-accent" : "border-site-border-strong bg-site-bg",
                    )}
                  >
                    {acknowledged && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <span className="font-semibold">J&apos;ai lu et j&apos;accepte les conditions</span>
                </button>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-site-border pt-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs text-site-muted">
                  {formatServicesCount(previewLines.length)} · {formatDurationMinutes(getTotalDurationMinutes(previewLines))}
                </p>
                <p className="text-lg font-bold tabular-nums">{money(getServicesTotalDollars(previewLines))}</p>
              </div>
              <WebBookingCta type="button" disabled={!canConfirm} onClick={handleConfirm}>
                Ajouter
              </WebBookingCta>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
