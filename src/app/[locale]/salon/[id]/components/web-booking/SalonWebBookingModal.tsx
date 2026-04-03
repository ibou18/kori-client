"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { SalonWebBookingFlow } from "./SalonWebBookingFlow";
import type { WebBookingServicePayload } from "./types";

interface SalonWebBookingModalProps {
  open: boolean;
  onClose: () => void;
  salonId: string;
  salonName: string;
  locale: string;
  salonProvince?: string;
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
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto z-[100]">
        <SalonWebBookingFlow
          variant="modal"
          open={open}
          salonId={salonId}
          salonName={salonName}
          locale={locale}
          salonProvince={salonProvince}
          salonOffersHomeService={salonOffersHomeService}
          service={service}
        />
      </DialogContent>
    </Dialog>
  );
}
