"use client";

import { getSalonBookingAvailabilityApi } from "@/app/data/services";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  SalonBookingAvailabilityPayload,
  SalonBookingTimeSlot,
  WebBookingAssignmentMode,
  WebBookingStaffMember,
} from "./types";
import { WebBookingCta, WebBookingStepActions, type WebBookingFooterSummary } from "./WebBookingStepActions";

interface WebBookingSlotPanelProps {
  salonId: string;
  /** Durée totale de toutes les prestations : le créneau doit les couvrir. */
  durationMin: number;
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
  /** Résumé de la sélection, avec lien « Modifier » vers l'étape prestation. */
  selectionTitle: string;
  selectionMeta: string;
  onEditSelection: () => void;
  summary: WebBookingFooterSummary | null;
  /** Bloc affiché sous le récapitulatif (produits à récupérer au salon). */
  extra?: React.ReactNode;
}

const DAY_STRIP_LENGTH = 5;

function localDateToISO(d: Date): string {
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

const initialsOf = (s: WebBookingStaffMember) =>
  `${s.firstName?.[0] ?? ""}${s.lastName?.[0] ?? ""}`.toUpperCase() || "?";

/**
 * Étape créneau (maquette) : récapitulatif avec « Modifier », choix de la
 * professionnelle en avatars, bande de cinq jours + calendrier complet, grille
 * de créneaux sur trois colonnes.
 */
export function WebBookingSlotPanel({
  salonId,
  durationMin,
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
  selectionTitle,
  selectionMeta,
  onEditSelection,
  summary,
  extra,
}: WebBookingSlotPanelProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [date, setDate] = useState(() => localDateToISO(today));
  const [stripStart, setStripStart] = useState<Date>(today);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const selectedCalendarDate = useMemo(() => parseISODateToLocal(date), [date]);
  const stripDays = useMemo(
    () => Array.from({ length: DAY_STRIP_LENGTH }, (_, i) => addDays(stripStart, i)),
    [stripStart],
  );

  const availabilityEmployeeId = assignmentMode === "SPECIFIC_EMPLOYEE" ? employeeId : undefined;
  const availabilityAssignmentMode: WebBookingAssignmentMode =
    assignmentMode === "SPECIFIC_EMPLOYEE" ? "SPECIFIC_EMPLOYEE" : "FIRST_AVAILABLE";

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["web-booking-availability", salonId, date, durationMin, availabilityAssignmentMode, availabilityEmployeeId ?? ""],
    queryFn: async (): Promise<SalonBookingAvailabilityPayload | null> => {
      const res = await getSalonBookingAvailabilityApi(salonId, date, durationMin, {
        employeeId: availabilityEmployeeId,
        assignmentMode: availabilityAssignmentMode,
      });
      if (!res?.success || !res?.data) return null;
      return res.data as SalonBookingAvailabilityPayload;
    },
    enabled:
      !!salonId && !!date && durationMin > 0 && !!selectedOptionId && (assignmentMode === "FIRST_AVAILABLE" || !!employeeId),
    staleTime: 60_000,
  });

  const slots = useMemo(() => (data?.day?.timeSlots ?? []).filter((s) => s.available), [data]);
  const showSlotPro = hasEmployees && assignmentMode === "FIRST_AVAILABLE";

  const canContinue =
    !!selectedOptionId &&
    !!selectedSlot &&
    (assignmentMode === "FIRST_AVAILABLE" || (assignmentMode === "SPECIFIC_EMPLOYEE" && !!employeeId));

  const pickDate = (d: Date) => {
    setDate(localDateToISO(d));
    onSelectSlot(null);
  };

  const slotNote = isLoading || isFetching
    ? "Chargement…"
    : isError || !data
      ? ""
      : slots.length === 0
        ? "Aucun créneau"
        : `${slots.length} créneau${slots.length > 1 ? "x" : ""}`;

  if (!selectedOptionId) {
    return (
      <div className="px-5 py-5">
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Choisissez d&apos;abord une formule de prestation.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-5">
        {/* Récapitulatif */}
        <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-site-border bg-site-surface-2 px-4 py-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate font-semibold">{selectionTitle}</p>
            <p className="text-sm text-site-fg-2">{selectionMeta}</p>
          </div>
          <button
            type="button"
            onClick={onEditSelection}
            className="flex min-h-11 items-center text-sm font-semibold text-site-accent hover:underline"
          >
            Modifier
          </button>
        </div>

        {extra}

        {/* Professionnelle */}
        {hasEmployees && staffOptions.length > 0 && (
          <div role="radiogroup" aria-labelledby="wb-pro-title" className="flex flex-col gap-2.5">
            <p id="wb-pro-title" className="font-semibold">
              Avec qui ?
            </p>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              <StaffChoice
                checked={assignmentMode === "FIRST_AVAILABLE"}
                initials="✓"
                name="Peu importe"
                onClick={() => {
                  onSelectSlot(null);
                  onAssignmentModeChange("FIRST_AVAILABLE");
                  onEmployeeIdChange(undefined);
                }}
              />
              {staffOptions.map((s) => (
                <StaffChoice
                  key={s.id}
                  checked={assignmentMode === "SPECIFIC_EMPLOYEE" && s.id === employeeId}
                  initials={initialsOf(s)}
                  name={`${s.firstName}${s.lastName ? ` ${s.lastName.charAt(0)}.` : ""}`}
                  onClick={() => {
                    onSelectSlot(null);
                    onAssignmentModeChange("SPECIFIC_EMPLOYEE");
                    onEmployeeIdChange(s.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Date */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold capitalize">
              {selectedCalendarDate ? format(selectedCalendarDate, "MMMM yyyy", { locale: fr }) : "Date"}
            </p>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen} modal={false}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Ouvrir le calendrier"
                  aria-expanded={datePickerOpen}
                  className="flex min-h-10 items-center gap-1.5 rounded-full border border-site-border-strong bg-site-bg px-3.5 text-sm font-semibold text-site-fg hover:bg-site-surface"
                >
                  <CalendarIcon className="size-4" />
                  Calendrier
                </button>
              </PopoverTrigger>
              <PopoverContent className="z-[120] w-auto rounded-2xl border-site-border p-0 shadow-lg" align="end">
                <Calendar
                  mode="single"
                  locale={fr}
                  selected={selectedCalendarDate}
                  onSelect={(d) => {
                    if (!d) return;
                    pickDate(d);
                    setStripStart(startOfDay(d));
                    setDatePickerOpen(false);
                  }}
                  disabled={{ before: today }}
                  initialFocus
                  classNames={{
                    day_selected:
                      "bg-site-accent text-site-on-accent hover:bg-site-accent hover:text-site-on-accent focus:bg-site-accent focus:text-site-on-accent",
                    day_today: "bg-site-accent-soft text-site-fg font-semibold aria-selected:bg-site-accent aria-selected:text-site-on-accent",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${DAY_STRIP_LENGTH}, minmax(0, 1fr))` }}>
            {stripDays.map((d) => {
              const iso = localDateToISO(d);
              const active = iso === date;
              return (
                <button
                  key={iso}
                  type="button"
                  aria-pressed={active}
                  aria-label={format(d, "EEEE d MMMM", { locale: fr })}
                  onClick={() => pickDate(d)}
                  className={cn(
                    "flex h-[68px] flex-col items-center justify-center gap-0.5 rounded-[14px] border transition-colors",
                    active
                      ? "border-site-accent bg-site-accent text-site-on-accent"
                      : "border-site-border-strong bg-site-bg text-site-fg hover:bg-site-surface",
                  )}
                >
                  <span className="text-xs capitalize">{format(d, "EEE", { locale: fr }).replace(".", "")}</span>
                  <span className="text-lg font-semibold tabular-nums">{format(d, "d")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Créneaux */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold">Créneaux</p>
            <p className="text-[13px] text-site-muted">{slotNote}</p>
          </div>
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-site-muted">
              <Loader2 className="size-4 animate-spin text-site-accent" />
              Chargement des disponibilités…
            </div>
          ) : isError || !data ? (
            <div className="flex flex-col items-start gap-2 py-2">
              <p className="text-sm text-red-600">Impossible de charger les créneaux.</p>
              <button type="button" onClick={() => refetch()} className="text-sm font-semibold text-site-accent underline">
                Réessayer
              </button>
            </div>
          ) : data.day?.hasHoliday ? (
            <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {data.day.holidayReason || "Le salon est fermé ce jour-là."}
            </p>
          ) : slots.length === 0 ? (
            <p className="py-2 text-sm text-site-muted">Aucun créneau libre pour cette date. Choisissez un autre jour.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const selected = selectedSlot?.startDateTime === slot.startDateTime;
                return (
                  <button
                    key={slot.startDateTime}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectSlot(slot)}
                    className={cn(
                      "flex min-h-12 flex-col items-center justify-center rounded-xl border py-1 transition-colors",
                      selected
                        ? "border-site-accent bg-site-accent text-site-on-accent"
                        : "border-site-border-strong bg-site-bg text-site-fg hover:bg-site-surface",
                    )}
                  >
                    <span className="text-[15px] font-semibold leading-[1.2] tabular-nums">{slot.startTime}</span>
                    {showSlotPro && slot.suggestedEmployee?.firstName && (
                      <span className={cn("text-[11px] leading-[1.2]", selected ? "opacity-80" : "text-site-muted")}>
                        {slot.suggestedEmployee.firstName}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <WebBookingStepActions summary={summary}>
        <WebBookingCta type="button" disabled={!canContinue} onClick={onContinue}>
          Continuer
        </WebBookingCta>
      </WebBookingStepActions>
    </>
  );
}

function StaffChoice({
  checked,
  initials,
  name,
  onClick,
}: {
  checked: boolean;
  initials: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className="flex min-w-[64px] shrink-0 flex-col items-center gap-1 text-site-fg"
    >
      <span
        aria-hidden
        className={cn(
          "flex size-10 rounded-full border-2 p-0.5",
          checked ? "border-site-accent" : "border-transparent",
        )}
      >
        <span
          className={cn(
            "flex flex-1 items-center justify-center rounded-full font-site-display text-[11px] font-bold",
            checked ? "bg-site-accent text-site-on-accent" : "bg-site-surface text-site-fg",
          )}
        >
          {initials}
        </span>
      </span>
      <span className={cn("max-w-[72px] truncate text-center text-xs leading-[1.2]", checked && "font-semibold")}>{name}</span>
    </button>
  );
}
