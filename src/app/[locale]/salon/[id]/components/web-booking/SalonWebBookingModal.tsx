"use client";

import { useGetPlatformConfig } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  service: WebBookingServicePayload | null;
}

export function SalonWebBookingModal({
  open,
  onClose,
  salonId,
  salonName,
  locale,
  salonProvince = "QC",
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
    null
  );

  const authenticated = status === "authenticated" && !!session?.user;

  useEffect(() => {
    if (!open) return;
    setSelectedSlot(null);
    if (authenticated) {
      setStep("slot");
    } else {
      setStep("auth");
    }
  }, [open, authenticated]);

  useEffect(() => {
    if (!open || !service?.options?.length) return;
    if (service.options.length === 1) {
      setSelectedOptionId(service.options[0].id);
    } else {
      setSelectedOptionId(null);
    }
  }, [open, service]);

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
        ? "Choisir un créneau"
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
          <ClientQuickAuthPanel
            onAuthenticated={() => setStep("slot")}
          />
        )}

        {step === "slot" && authenticated && (
          <>
            <WebBookingSlotPanel
              salonId={salonId}
              service={servicePayload}
              selectedOptionId={selectedOptionId}
              onSelectOption={setSelectedOptionId}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
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
                onBack={() => setStep("slot")}
              />
            </>
          )}
      </DialogContent>
    </Dialog>
  );
}
