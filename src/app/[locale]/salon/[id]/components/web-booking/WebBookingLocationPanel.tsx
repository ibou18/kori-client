"use client";

import { GoogleAddressAutocomplete, type AddressData } from "@/components/ui/GoogleAddressAutocomplete";
import { cn } from "@/lib/utils";
import { Home, Store } from "lucide-react";

import { getCombinedAvailableLocations } from "./bookingLocation";
import { getBookingTravelFeeDollars } from "./bookingSelection";
import { formatSalonPriceDollars } from "./pricing";
import type { WebBookingSelectedService } from "./types";
import { WebBookingCta, WebBookingStepActions, type WebBookingFooterSummary } from "./WebBookingStepActions";

interface WebBookingLocationPanelProps {
  salonOffersHomeService: boolean;
  /** Toutes les prestations choisies : le lieu doit convenir à chacune. */
  lines: WebBookingSelectedService[];
  isHomeService: boolean;
  onIsHomeServiceChange: (value: boolean) => void;
  homeServiceAddress: AddressData | null;
  onHomeServiceAddressChange: (value: AddressData | null) => void;
  onContinue: () => void;
  summary: WebBookingFooterSummary | null;
}

/** Étape Lieu : au salon ou à domicile (si possible pour toutes les prestations), avec adresse assistée. */
export function WebBookingLocationPanel({
  salonOffersHomeService,
  lines,
  isHomeService,
  onIsHomeServiceChange,
  homeServiceAddress,
  onHomeServiceAddressChange,
  onContinue,
  summary,
}: WebBookingLocationPanelProps) {
  const combined = getCombinedAvailableLocations(lines.map((l) => l.service));
  const canSalon = combined.includes("SALON_ONLY");
  const canHome = salonOffersHomeService && combined.includes("HOME_ONLY");
  const locationMode = canHome && !canSalon ? "home_only" : canHome ? "choice" : "salon_only";
  const travelFee = getBookingTravelFeeDollars(lines, true);
  const travelFeeLabel =
    travelFee > 0
      ? `+ ${formatSalonPriceDollars(travelFee)} $${lines.length > 1 ? " (une fois pour la réservation)" : ""}`
      : "Sans frais";

  const homeAddressOk =
    !isHomeService ||
    (!!homeServiceAddress?.street && !!homeServiceAddress?.city && !!homeServiceAddress?.formattedAddress);

  const Option = ({
    active,
    icon,
    title,
    hint,
    meta,
    onClick,
  }: {
    active: boolean;
    icon: React.ReactNode;
    title: string;
    hint: string;
    meta: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex min-h-[72px] items-center gap-3.5 rounded-[14px] border px-4 text-left transition-colors",
        active ? "border-site-accent bg-site-accent-soft" : "border-site-border-strong bg-site-bg hover:bg-site-surface",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-site-surface text-site-fg">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-[13px] text-site-muted">{hint}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-site-fg">{meta}</span>
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2",
          active ? "border-site-accent" : "border-site-border-strong",
        )}
      >
        <span className={cn("size-2.5 rounded-full", active ? "bg-site-accent" : "bg-transparent")} />
      </span>
    </button>
  );

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-5">
        <div role="radiogroup" aria-label="Lieu du rendez-vous" className="flex flex-col gap-2.5">
          {locationMode === "choice" && (
            <Option
              active={!isHomeService}
              icon={<Store className="size-[18px]" />}
              title="Au salon"
              hint="Vous vous déplacez au salon"
              meta="Sans frais"
              onClick={() => {
                onIsHomeServiceChange(false);
                onHomeServiceAddressChange(null);
              }}
            />
          )}
          {(locationMode === "choice" || locationMode === "home_only") && (
            <Option
              active={isHomeService}
              icon={<Home className="size-[18px]" />}
              title="À domicile"
              hint="La prestataire se déplace chez vous"
              meta={travelFeeLabel}
              onClick={() => onIsHomeServiceChange(true)}
            />
          )}
        </div>

        {isHomeService && (
          <div className="flex flex-col gap-1.5">
            <GoogleAddressAutocomplete
              id="wb-home-address"
              label="Votre adresse"
              value={homeServiceAddress?.formattedAddress ?? ""}
              onAddressSelect={(addr) => onHomeServiceAddressChange(addr)}
              placeholder="Rechercher votre adresse…"
              required
            />
            <p className="text-xs text-site-muted">
              Saisie assistée par Google : choisissez une suggestion pour valider l&apos;adresse.
            </p>
          </div>
        )}
      </div>

      <WebBookingStepActions summary={summary}>
        <WebBookingCta type="button" disabled={!homeAddressOk} onClick={onContinue}>
          Continuer vers le créneau
        </WebBookingCta>
      </WebBookingStepActions>
    </>
  );
}
