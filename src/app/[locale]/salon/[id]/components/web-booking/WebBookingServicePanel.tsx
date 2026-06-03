"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { getOptionPriceDollars } from "./pricing";
import type {
  WebBookingServiceOption,
  WebBookingServicePayload,
} from "./types";
import { WebBookingServiceInfo } from "./WebBookingServiceInfo";

interface WebBookingServicePanelProps {
  service: WebBookingServicePayload;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onContinue: () => void;
  continueLabel: string;
  layoutVariant?: "modal" | "page";
}

export function WebBookingServicePanel({
  service,
  selectedOptionId,
  onSelectOption,
  onContinue,
  continueLabel,
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

      <Button
        type="button"
        className="w-full bg-gradient-to-r from-[#53745D] to-[#3a5a47] text-white shadow-md hover:brightness-110 disabled:opacity-50"
        disabled={!canContinue}
        onClick={onContinue}
      >
        {continueLabel}
      </Button>
    </div>
  );
}
