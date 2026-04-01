"use client";

import { getSalonBookingAvailabilityApi } from "@/app/data/services";
import { Button } from "@/components/ui/button";
import {
  GoogleAddressAutocomplete,
  type AddressData,
} from "@/components/ui/GoogleAddressAutocomplete";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { getBookingLocationMode } from "./bookingLocation";
import type {
  SalonBookingAvailabilityPayload,
  SalonBookingTimeSlot,
  WebBookingServiceOption,
  WebBookingServicePayload,
} from "./types";
import {
  formatSalonPriceDollars,
  getOptionPriceDollars,
  getServiceDurationMinutes,
} from "./pricing";

interface WebBookingSlotPanelProps {
  salonId: string;
  salonOffersHomeService: boolean;
  service: WebBookingServicePayload;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  selectedSlot: SalonBookingTimeSlot | null;
  onSelectSlot: (slot: SalonBookingTimeSlot | null) => void;
  isHomeService: boolean;
  onIsHomeServiceChange: (value: boolean) => void;
  homeServiceAddress: AddressData | null;
  onHomeServiceAddressChange: (value: AddressData | null) => void;
  onContinue: () => void;
}

function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function WebBookingSlotPanel({
  salonId,
  salonOffersHomeService,
  service,
  selectedOptionId,
  onSelectOption,
  selectedSlot,
  onSelectSlot,
  isHomeService,
  onIsHomeServiceChange,
  homeServiceAddress,
  onHomeServiceAddressChange,
  onContinue,
}: WebBookingSlotPanelProps) {
  const [date, setDate] = useState(() => todayISODate());
  const durationMin = getServiceDurationMinutes(service.duration);

  const locationMode = getBookingLocationMode(
    salonOffersHomeService,
    service.availableLocations,
  );
  const showLocationSection = locationMode !== "salon_only";
  const travelFee = service.homeTravelFeeDollars ?? 0;
  const travelFeeLabel =
    travelFee > 0 ? `+ ${formatSalonPriceDollars(travelFee)} $` : "Gratuit";

  const options: WebBookingServiceOption[] = service.options?.length
    ? service.options
    : [];

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["web-booking-availability", salonId, date, durationMin],
    queryFn: async (): Promise<SalonBookingAvailabilityPayload | null> => {
      const res = await getSalonBookingAvailabilityApi(
        salonId,
        date,
        durationMin,
      );
      if (!res?.success || !res?.data) return null;
      return res.data as SalonBookingAvailabilityPayload;
    },
    enabled: !!salonId && !!date && durationMin > 0 && options.length > 0,
    staleTime: 60_000,
  });

  const slots = useMemo(() => {
    const list = data?.day?.timeSlots ?? [];
    return list.filter((s) => s.available);
  }, [data]);

  const homeAddressOk =
    !isHomeService ||
    (!!homeServiceAddress?.street &&
      !!homeServiceAddress?.city &&
      !!homeServiceAddress?.formattedAddress);

  const canContinue = !!selectedOptionId && !!selectedSlot && homeAddressOk;

  if (options.length === 0) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        Ce service ne propose pas de formule réservable en ligne pour le moment.
        Utilisez l&apos;application korí.
      </p>
    );
  }

  return (
    <div className="space-y-5 max-h-[min(70vh,520px)] overflow-y-auto pr-1">
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

      {showLocationSection && (
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
                Saisie assistée par Google : choisissez une suggestion pour
                valider l’adresse.
              </p>
            </div>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="wb-date" className="text-base font-semibold">
          Date
        </Label>
        <input
          id="wb-date"
          type="date"
          min={todayISODate()}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            onSelectSlot(null);
          }}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#53745D]/30 focus:border-[#53745D]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Créneaux</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[#53745D] hover:bg-[#F0F4F1] hover:text-[#3a5a47]"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Actualiser
          </Button>
        </div>
        {isLoading || isFetching ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-[#53745D]" />
            Chargement des disponibilités…
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-red-600 py-4">
            Impossible de charger les créneaux. Réessayez plus tard.
          </p>
        ) : data.day?.hasHoliday ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {data.day.holidayReason || "Le salon est fermé ce jour-là."}
          </p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            Aucun créneau libre pour cette date. Choisissez un autre jour.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {slots.map((slot) => {
              const selected =
                selectedSlot?.startDateTime === slot.startDateTime;
              return (
                <button
                  key={slot.startDateTime}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    selected
                      ? "border-[#53745D] bg-[#F0F4F1] text-[#3a5a47]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#53745D]/40 hover:bg-[#F0F4F1]/40"
                  }`}
                >
                  {slot.startTime}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Button
        type="button"
        className="w-full bg-gradient-to-r from-[#53745D] to-[#3a5a47] text-white shadow-md hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
        disabled={!canContinue}
        onClick={onContinue}
      >
        Continuer vers le paiement
      </Button>
    </div>
  );
}
