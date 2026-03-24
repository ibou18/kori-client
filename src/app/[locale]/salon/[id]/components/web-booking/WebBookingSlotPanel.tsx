"use client";

import { getSalonBookingAvailabilityApi } from "@/app/data/services";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  SalonBookingAvailabilityPayload,
  SalonBookingTimeSlot,
  WebBookingServiceOption,
  WebBookingServicePayload,
} from "./types";
import { getOptionPriceDollars, getServiceDurationMinutes } from "./pricing";

interface WebBookingSlotPanelProps {
  salonId: string;
  service: WebBookingServicePayload;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  selectedSlot: SalonBookingTimeSlot | null;
  onSelectSlot: (slot: SalonBookingTimeSlot | null) => void;
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
  service,
  selectedOptionId,
  onSelectOption,
  selectedSlot,
  onSelectSlot,
  onContinue,
}: WebBookingSlotPanelProps) {
  const [date, setDate] = useState(todayISODate());
  const durationMin = getServiceDurationMinutes(service.duration);

  const options: WebBookingServiceOption[] = service.options?.length
    ? service.options
    : [];

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["web-booking-availability", salonId, date, durationMin],
    queryFn: async (): Promise<SalonBookingAvailabilityPayload | null> => {
      const res = await getSalonBookingAvailabilityApi(salonId, date, durationMin);
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

  const canContinue = !!selectedOptionId && !!selectedSlot;

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
          <Label className="text-base font-semibold">Formule</Label>
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
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 rounded-full border-2 ${
                      picked
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  />
                  <div className="flex-1 flex justify-between gap-2">
                    <span className="text-sm font-medium">{opt.name}</span>
                    <span className="text-sm text-blue-600 font-semibold">
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <span className="font-medium">{options[0].name}</span>
          <span className="float-right font-semibold text-blue-600">
            {getOptionPriceDollars(options[0]).toFixed(2)} $
          </span>
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
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Créneaux</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Actualiser
          </Button>
        </div>
        {isLoading || isFetching ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
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
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
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
        className="w-full"
        disabled={!canContinue}
        onClick={onContinue}
      >
        Continuer vers le paiement
      </Button>
    </div>
  );
}
