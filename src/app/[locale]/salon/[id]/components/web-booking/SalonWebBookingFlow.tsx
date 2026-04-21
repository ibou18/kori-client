"use client";

import { useGetPlatformConfig } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AddressData } from "@/components/ui/GoogleAddressAutocomplete";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { getBookingLocationMode } from "./bookingLocation";
import { ClientQuickAuthPanel } from "./ClientQuickAuthPanel";
import { WebBookingPayPanel } from "./WebBookingPayPanel";
import { WebBookingSlotPanel } from "./WebBookingSlotPanel";
import type {
  SalonBookingTimeSlot,
  WebBookingServicePayload,
  WebBookingStep,
} from "./types";

export interface SalonWebBookingFlowProps {
  variant: "modal" | "page";
  /** Modal : contrôle l’affichage. Page : doit être true si le flux est monté. */
  open?: boolean;
  salonId: string;
  salonName: string;
  locale: string;
  salonProvince?: string;
  salonOffersHomeService?: boolean;
  service: WebBookingServicePayload | null;
  /** Page : lien ou navigation retour vers la fiche service */
  backHref?: string;
}

export function SalonWebBookingFlow({
  variant,
  open = true,
  salonId,
  salonName,
  locale,
  salonProvince = "QC",
  salonOffersHomeService = false,
  service,
  backHref,
}: SalonWebBookingFlowProps) {
  const { data: session, status } = useSession();
  const sessionUser = session?.user as
    | { id?: string; email?: string | null }
    | undefined;
  const { data: platformConfigData } = useGetPlatformConfig();
  const commissionRate =
    platformConfigData?.data?.defaultCommissionRate ??
    platformConfigData?.defaultCommissionRate ??
    0.06;

  const [step, setStep] = useState<WebBookingStep>("auth");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SalonBookingTimeSlot | null>(
    null,
  );
  const [isHomeService, setIsHomeService] = useState(false);
  const [homeServiceAddress, setHomeServiceAddress] =
    useState<AddressData | null>(null);
  const [slotPanelSessionKey, setSlotPanelSessionKey] = useState(0);

  const wasDialogOpenRef = useRef(false);
  const lastPageServiceIdRef = useRef<string | null>(null);

  const authenticated = status === "authenticated" && !!session?.user;
  const active = variant === "page" || !!open;

  useEffect(() => {
    if (variant === "modal") {
      if (!open) {
        wasDialogOpenRef.current = false;
        return;
      }
      if (!wasDialogOpenRef.current) {
        setSlotPanelSessionKey((k) => k + 1);
        setSelectedSlot(null);
        setHomeServiceAddress(null);
        setStep(authenticated ? "slot" : "auth");
        wasDialogOpenRef.current = true;
        return;
      }
      if (authenticated) {
        setStep((s) => (s === "auth" ? "slot" : s));
      } else {
        setStep("auth");
      }
      return;
    }

    // Page : réinitialiser quand la prestation chargée change
    if (!service?.id) return;
    if (lastPageServiceIdRef.current !== service.id) {
      lastPageServiceIdRef.current = service.id;
      setSlotPanelSessionKey((k) => k + 1);
      setSelectedSlot(null);
      setHomeServiceAddress(null);
      setStep(authenticated ? "slot" : "auth");
      return;
    }
    if (authenticated) {
      setStep((s) => (s === "auth" ? "slot" : s));
    } else {
      setStep("auth");
    }
  }, [variant, open, authenticated, service?.id]);

  useEffect(() => {
    if (!active || !service?.options?.length) return;
    if (service.options.length === 1) {
      setSelectedOptionId(service.options[0].id);
    } else {
      setSelectedOptionId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, service?.id, service?.options?.length]);

  const serviceLocationsKey = service?.availableLocations?.join("|") ?? "";

  useEffect(() => {
    if (!active || !service?.id) return;
    const mode = getBookingLocationMode(
      salonOffersHomeService,
      service.availableLocations,
    );
    if (mode === "home_only") {
      setIsHomeService(true);
    } else if (mode === "salon_only") {
      setIsHomeService(false);
      setHomeServiceAddress(null);
    } else {
      setIsHomeService(false);
      setHomeServiceAddress(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, service?.id, salonOffersHomeService, serviceLocationsKey]);

  const servicePayload = useMemo((): WebBookingServicePayload | null => {
    if (!service) return null;
    return service;
  }, [service]);

  const title =
    step === "auth"
      ? "Votre compte"
      : step === "slot"
        ? "Option et créneau"
        : "Paiement de l'acompte";

  const stepIndex = step === "auth" ? 0 : step === "slot" ? 1 : 2;

  const stepLabels = ["Compte", "Créneau", "Paiement"];

  if (variant === "modal" && !open) return null;
  if (!servicePayload) return null;
  const payload = servicePayload;

  const headerBlock =
    variant === "modal" ? (
      <DialogHeader>
        <DialogTitle className="text-left pr-8">{title}</DialogTitle>
        <p className="text-sm text-slate-500 font-normal text-left">
          {salonName} — {payload.name}
        </p>
      </DialogHeader>
    ) : (
      <header className="mb-8">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-[#53745D] font-medium hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au salon
          </Link>
        ) : null}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Réservation en ligne
        </h1>
        <p className="text-slate-600 mt-1">
          {salonName} — {payload.name}
        </p>
        <p className="text-sm font-semibold text-slate-800 mt-6 mb-3">
          {title}
        </p>
        <ol className="flex flex-wrap gap-2 md:gap-4" aria-label="Étapes">
          {stepLabels.map((label, i) => {
            const done = authenticated && i < stepIndex;
            const current = i === stepIndex;
            return (
              <li
                key={label}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border ${
                  current
                    ? "border-[#53745D] bg-[#F0F4F1] text-[#3a5a47]"
                    : done
                      ? "border-[#53745D]/40 bg-white text-[#53745D]"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    current
                      ? "bg-[#53745D] text-white"
                      : done
                        ? "bg-[#53745D]/20 text-[#53745D]"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      </header>
    );

  return (
    <>
      {headerBlock}

      {step !== "auth" && !authenticated && (
        <p className="text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mb-4">
          Session expirée. Reconnectez-vous pour continuer.
        </p>
      )}

      {step === "auth" && (
        <ClientQuickAuthPanel onAuthenticated={() => setStep("slot")} />
      )}

      {step === "slot" && authenticated && (
        <WebBookingSlotPanel
          key={slotPanelSessionKey}
          salonId={salonId}
          salonOffersHomeService={salonOffersHomeService}
          service={payload}
          selectedOptionId={selectedOptionId}
          onSelectOption={setSelectedOptionId}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          isHomeService={isHomeService}
          onIsHomeServiceChange={setIsHomeService}
          homeServiceAddress={homeServiceAddress}
          onHomeServiceAddressChange={setHomeServiceAddress}
          onContinue={() => setStep("pay")}
          layoutVariant={variant}
        />
      )}

      {step === "pay" &&
        authenticated &&
        sessionUser?.id &&
        selectedOptionId &&
        selectedSlot && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`w-fit px-0 text-slate-600 ${variant === "modal" ? "-mt-2 -mb-2" : "mb-2"}`}
              onClick={() => setStep("slot")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Créneau
            </Button>
            <WebBookingPayPanel
              salonId={salonId}
              salonOffersHomeService={salonOffersHomeService}
              province={(salonProvince || "QC").toUpperCase()}
              clientId={sessionUser.id}
              clientEmail={sessionUser.email ?? ""}
              locale={locale}
              service={payload}
              selectedOptionId={selectedOptionId}
              selectedSlot={selectedSlot}
              commissionRate={commissionRate}
              isHomeService={isHomeService}
              homeServiceAddress={homeServiceAddress}
              onBack={() => setStep("slot")}
            />
          </>
        )}
    </>
  );
}
