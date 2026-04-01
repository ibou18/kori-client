"use client";

import { useGetPlatformConfig } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AddressData } from "@/components/ui/GoogleAddressAutocomplete";
import { useSession } from "next-auth/react";
import { ChevronLeft } from "lucide-react";
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

interface SalonWebBookingModalProps {
  open: boolean;
  onClose: () => void;
  salonId: string;
  salonName: string;
  locale: string;
  /** Province pour taxes Stripe (ex. QC) */
  salonProvince?: string;
  /** Si le salon propose des déplacements à domicile (donnée salon). */
  salonOffersHomeService?: boolean;
  service: WebBookingServicePayload | null;
}

export function SalonWebBookingModal({
  open,
  onClose,
  salonId,
  salonName,
  locale,
  salonProvince = "QC",
  salonOffersHomeService = false,
  service,
}: SalonWebBookingModalProps) {
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
  /** Incrémenté à chaque ouverture du dialogue pour remonter le panneau créneaux (date = jour courant). */
  const [slotPanelSessionKey, setSlotPanelSessionKey] = useState(0);
  /** false = dialogue fermé ; true = déjà ouvert dans cette « session » modale (ne pas revider créneau au moindre changement de session). */
  const wasDialogOpenRef = useRef(false);

  const authenticated = status === "authenticated" && !!session?.user;

  useEffect(() => {
    if (!open) {
      wasDialogOpenRef.current = false;
      return;
    }

    if (!wasDialogOpenRef.current) {
      // Ouverture du dialogue : jour courant + créneau remis à zéro (voir key sur WebBookingSlotPanel)
      setSlotPanelSessionKey((k) => k + 1);
      setSelectedSlot(null);
      setHomeServiceAddress(null);
      setStep(authenticated ? "slot" : "auth");
      wasDialogOpenRef.current = true;
      return;
    }

    // Déjà ouvert : ne jamais vider le créneau ici (retour paiement → créneau, ou refetch session).
    if (authenticated) {
      setStep((s) => (s === "auth" ? "slot" : s));
    } else {
      setStep("auth");
    }
  }, [open, authenticated]);

  // Ne pas dépendre de `service` ni de `service.options` (réf. instable) : relancer seulement à l’ouverture / changement de prestation.
  useEffect(() => {
    if (!open || !service?.options?.length) return;
    if (service.options.length === 1) {
      setSelectedOptionId(service.options[0].id);
    } else {
      setSelectedOptionId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `service.options` change de ref à chaque rendu ; on s’appuie sur id + longueur
  }, [open, service?.id, service?.options?.length]);

  const serviceLocationsKey = service?.availableLocations?.join("|") ?? "";

  useEffect(() => {
    if (!open || !service?.id) return;
    const mode = getBookingLocationMode(
      salonOffersHomeService,
      service.availableLocations
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `availableLocations` via serviceLocationsKey (ref instable)
  }, [open, service?.id, salonOffersHomeService, serviceLocationsKey]);

  const servicePayload = useMemo((): WebBookingServicePayload | null => {
    if (!service) return null;
    return service;
  }, [service]);

  const handleClose = () => {
    onClose();
  };

  const title =
    step === "auth"
      ? "Votre compte"
      : step === "slot"
        ? "Choisir une option et un créneau"
        : "Paiement de l'acompte";

  if (!servicePayload) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <DialogTitle className="text-left pr-8">{title}</DialogTitle>
          <p className="text-sm text-slate-500 font-normal text-left">
            {salonName} — {servicePayload.name}
          </p>
        </DialogHeader>

        {step !== "auth" && !authenticated && (
          <p className="text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
            Session expirée. Reconnectez-vous pour continuer.
          </p>
        )}

        {step === "auth" && (
          <ClientQuickAuthPanel onAuthenticated={() => setStep("slot")} />
        )}

        {step === "slot" && authenticated && (
          <>
            <WebBookingSlotPanel
              key={slotPanelSessionKey}
              salonId={salonId}
              salonOffersHomeService={salonOffersHomeService}
              service={servicePayload}
              selectedOptionId={selectedOptionId}
              onSelectOption={setSelectedOptionId}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              isHomeService={isHomeService}
              onIsHomeServiceChange={setIsHomeService}
              homeServiceAddress={homeServiceAddress}
              onHomeServiceAddressChange={setHomeServiceAddress}
              onContinue={() => setStep("pay")}
            />
          </>
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
                className="w-fit -mt-2 -mb-2 px-0 text-slate-600"
                onClick={() => setStep("slot")}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Créneau
              </Button>
              <WebBookingPayPanel
                salonId={salonId}
                province={(salonProvince || "QC").toUpperCase()}
                clientId={sessionUser.id}
                clientEmail={sessionUser.email ?? ""}
                locale={locale}
                service={servicePayload}
                selectedOptionId={selectedOptionId}
                selectedSlot={selectedSlot}
                commissionRate={commissionRate}
                isHomeService={isHomeService}
                homeServiceAddress={homeServiceAddress}
                onBack={() => setStep("slot")}
              />
            </>
          )}
      </DialogContent>
    </Dialog>
  );
}
