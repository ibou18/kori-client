"use client";

import { Button } from "@/components/ui/button";
import {
  GoogleAddressAutocomplete,
  type AddressData,
} from "@/components/ui/GoogleAddressAutocomplete";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

import { getBookingLocationMode } from "./bookingLocation";
import {
  formatSalonPriceDollars,
  getEffectiveHomeTravelFeeDollars,
} from "./pricing";
import type { WebBookingServicePayload } from "./types";

interface WebBookingLocationPanelProps {
  salonOffersHomeService: boolean;
  service: WebBookingServicePayload;
  isHomeService: boolean;
  onIsHomeServiceChange: (value: boolean) => void;
  homeServiceAddress: AddressData | null;
  onHomeServiceAddressChange: (value: AddressData | null) => void;
  onContinue: () => void;
  layoutVariant?: "modal" | "page";
}

export function WebBookingLocationPanel({
  salonOffersHomeService,
  service,
  isHomeService,
  onIsHomeServiceChange,
  homeServiceAddress,
  onHomeServiceAddressChange,
  onContinue,
  layoutVariant = "modal",
}: WebBookingLocationPanelProps) {
  const locationMode = getBookingLocationMode(
    salonOffersHomeService,
    service.availableLocations,
  );
  const travelFee = getEffectiveHomeTravelFeeDollars(
    service.homeTravelFeeDollars,
    salonOffersHomeService,
  );
  const travelFeeLabel =
    travelFee > 0 ? `+ ${formatSalonPriceDollars(travelFee)} $` : "Gratuit";

  const homeAddressOk =
    !isHomeService ||
    (!!homeServiceAddress?.street &&
      !!homeServiceAddress?.city &&
      !!homeServiceAddress?.formattedAddress);

  return (
    <div
      className={cn(
        "space-y-5 overflow-y-auto pr-1",
        layoutVariant === "page"
          ? "max-h-none pb-2"
          : "max-h-[min(70vh,520px)]"
      )}
    >
      <div>
        <Label className="text-base font-semibold">Lieu</Label>
        <div className="mt-2 space-y-2">
          {locationMode === "choice" && (
            <button
              type="button"
              onClick={() => {
                onIsHomeServiceChange(false);
                onHomeServiceAddressChange(null);
              }}
              className={`w-full flex items-stretch gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                !isHomeService
                  ? "border-[#53745D] bg-[#F0F4F1]/60"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">En salon</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vous vous déplacez au salon
                </p>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  Gratuit
                </p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 self-center ${
                  !isHomeService
                    ? "border-[#53745D] bg-[#53745D] text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {!isHomeService ? (
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </div>
            </button>
          )}

          {(locationMode === "choice" || locationMode === "home_only") && (
            <button
              type="button"
              onClick={() => onIsHomeServiceChange(true)}
              className={`w-full flex items-stretch gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                isHomeService
                  ? "border-[#53745D] bg-[#F0F4F1]/60"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">À domicile</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  La professionnelle se déplace chez vous
                </p>
                <p className="text-sm font-medium text-slate-700 mt-1">
                  {travelFeeLabel}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 self-center ${
                  isHomeService
                    ? "border-[#53745D] bg-[#53745D] text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {isHomeService ? (
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </div>
            </button>
          )}
        </div>

        {isHomeService && (
          <div className="mt-3">
            <GoogleAddressAutocomplete
              id="wb-home-address"
              label="Votre adresse"
              value={homeServiceAddress?.formattedAddress ?? ""}
              onAddressSelect={(addr) => onHomeServiceAddressChange(addr)}
              placeholder="Rechercher votre adresse…"
              required
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Saisie assistée par Google : choisissez une suggestion pour valider
              l&apos;adresse.
            </p>
          </div>
        )}
      </div>

      <Button
        type="button"
        className="w-full bg-gradient-to-r from-[#53745D] to-[#3a5a47] text-white shadow-md hover:brightness-110 disabled:opacity-50"
        disabled={!homeAddressOk}
        onClick={onContinue}
      >
        Continuer vers le créneau
      </Button>
    </div>
  );
}
