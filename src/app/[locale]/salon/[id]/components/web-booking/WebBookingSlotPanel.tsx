"use client";

import { getSalonBookingAvailabilityApi } from "@/app/data/services";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  SalonBookingAvailabilityPayload,
  SalonBookingTimeSlot,
  WebBookingAssignmentMode,
  WebBookingServicePayload,
  WebBookingStaffMember,
} from "./types";
import { getServiceDurationMinutes } from "./pricing";

interface WebBookingSlotPanelProps {
  salonId: string;
  service: WebBookingServicePayload;
  selectedOptionId: string | null;
  selectedSlot: SalonBookingTimeSlot | null;
  onSelectSlot: (slot: SalonBookingTimeSlot | null) => void;
  hasEmployees: boolean;
  staffOptions: WebBookingStaffMember[];
  assignmentMode: WebBookingAssignmentMode;
  onAssignmentModeChange: (mode: WebBookingAssignmentMode) => void;
  employeeId: string | undefined;
  onEmployeeIdChange: (id: string | undefined) => void;
  onContinue: () => void;
  layoutVariant?: "modal" | "page";
}

function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODateToLocal(iso: string): Date | undefined {
  const parts = iso.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return undefined;
  const [y, mo, d] = parts;
  return new Date(y, mo - 1, d);
}

function localDateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function WebBookingSlotPanel({
  salonId,
  service,
  selectedOptionId,
  selectedSlot,
  onSelectSlot,
  hasEmployees,
  staffOptions,
  assignmentMode,
  onAssignmentModeChange,
  employeeId,
  onEmployeeIdChange,
  onContinue,
  layoutVariant = "modal",
}: WebBookingSlotPanelProps) {
  const [date, setDate] = useState(() => todayISODate());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const durationMin = getServiceDurationMinutes(service.duration);

  const selectedCalendarDate = useMemo(
    () => parseISODateToLocal(date),
    [date],
  );

  const availabilityEmployeeId =
    assignmentMode === "SPECIFIC_EMPLOYEE" ? employeeId : undefined;
  const availabilityAssignmentMode: WebBookingAssignmentMode =
    assignmentMode === "SPECIFIC_EMPLOYEE"
      ? "SPECIFIC_EMPLOYEE"
      : "FIRST_AVAILABLE";

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "web-booking-availability",
      salonId,
      date,
      durationMin,
      availabilityAssignmentMode,
      availabilityEmployeeId ?? "",
    ],
    queryFn: async (): Promise<SalonBookingAvailabilityPayload | null> => {
      const res = await getSalonBookingAvailabilityApi(
        salonId,
        date,
        durationMin,
        {
          employeeId: availabilityEmployeeId,
          assignmentMode: availabilityAssignmentMode,
        },
      );
      if (!res?.success || !res?.data) return null;
      return res.data as SalonBookingAvailabilityPayload;
    },
    enabled:
      !!salonId &&
      !!date &&
      durationMin > 0 &&
      !!selectedOptionId &&
      (assignmentMode === "FIRST_AVAILABLE" || !!employeeId),
    staleTime: 60_000,
  });

  const slots = useMemo(() => {
    const list = data?.day?.timeSlots ?? [];
    return list.filter((s) => s.available);
  }, [data]);

  const canContinue =
    !!selectedOptionId &&
    !!selectedSlot &&
    (assignmentMode === "FIRST_AVAILABLE" ||
      (assignmentMode === "SPECIFIC_EMPLOYEE" && !!employeeId));

  if (!selectedOptionId) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        Choisissez d&apos;abord une option de prestation.
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
      {hasEmployees && (
        <div>
          <Label className="text-base font-semibold">
            Choix du professionnel
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectSlot(null);
                onAssignmentModeChange("FIRST_AVAILABLE");
                onEmployeeIdChange(undefined);
              }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                assignmentMode === "FIRST_AVAILABLE"
                  ? "border-[#53745D] bg-[#F0F4F1] text-[#3a5a47]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#53745D]/40"
              }`}
            >
              Premier disponible
            </button>
            <button
              type="button"
              onClick={() => {
                const first = staffOptions[0];
                if (!first?.id) return;
                onSelectSlot(null);
                onAssignmentModeChange("SPECIFIC_EMPLOYEE");
                onEmployeeIdChange(first.id);
              }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                assignmentMode === "SPECIFIC_EMPLOYEE"
                  ? "border-[#53745D] bg-[#F0F4F1] text-[#3a5a47]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#53745D]/40"
              }`}
            >
              Choisir un professionnel
            </button>
          </div>
          {assignmentMode === "SPECIFIC_EMPLOYEE" && staffOptions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {staffOptions.map((s) => {
                const active = s.id === employeeId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelectSlot(null);
                      onAssignmentModeChange("SPECIFIC_EMPLOYEE");
                      onEmployeeIdChange(s.id);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-[#53745D] bg-[#F0F4F1] text-[#3a5a47]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#53745D]/40"
                    }`}
                  >
                    {s.firstName} {s.lastName?.charAt(0)}.
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      <div>
        <Label htmlFor="wb-date" className="text-base font-semibold">
          Date
        </Label>
        <Popover
          open={datePickerOpen}
          onOpenChange={setDatePickerOpen}
          modal={false}
        >
          <PopoverTrigger asChild>
            <Button
              id="wb-date"
              type="button"
              variant="outline"
              aria-expanded={datePickerOpen}
              className={cn(
                "mt-2 h-11 w-full justify-between rounded-lg border-slate-200 bg-white px-3 py-2 text-left font-normal text-slate-900 shadow-sm hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[#53745D]/30 focus-visible:ring-offset-0",
                !selectedCalendarDate && "text-slate-500",
              )}
            >
              <span className="truncate">
                {selectedCalendarDate
                  ? format(selectedCalendarDate, "EEEE d MMMM yyyy", {
                      locale: fr,
                    })
                  : "Choisir une date"}
              </span>
              <CalendarIcon
                className="h-4 w-4 shrink-0 text-slate-500"
                aria-hidden
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="z-[120] w-auto border-slate-200 p-0 shadow-lg"
            align="start"
          >
            <Calendar
              mode="single"
              locale={fr}
              selected={selectedCalendarDate}
              onSelect={(d) => {
                if (d) {
                  setDate(localDateToISO(d));
                  onSelectSlot(null);
                  setDatePickerOpen(false);
                }
              }}
              disabled={{ before: startOfDay(new Date()) }}
              initialFocus
              classNames={{
                day_selected:
                  "bg-[#53745D] text-white hover:bg-[#4A6854] hover:text-white focus:bg-[#53745D] focus:text-white",
                day_today:
                  "bg-[#F0F4F1] text-[#53745D] font-semibold aria-selected:bg-[#53745D] aria-selected:text-white",
              }}
            />
          </PopoverContent>
        </Popover>
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
        Continuer vers les remarques
      </Button>
    </div>
  );
}
