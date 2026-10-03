"use client";

import {
  calculateTaxesApi,
  createBookingApi,
  createCheckoutSessionApi,
  uploadBookingPhotoApi,
} from "@/app/data/services";
import type { AddressData } from "@/components/ui/GoogleAddressAutocomplete";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type {
  SalonBookingTimeSlot,
  WebBookingAssignmentMode,
  WebBookingSelectedService,
} from "./types";
import {
  buildBookingServicesPayload,
  formatDurationMinutes,
  formatServicesCount,
  getBookingTravelFeeDollars,
  getServicesTotalDollars,
  getTotalDurationMinutes,
  normalizeOrder,
} from "./bookingSelection";
import { computePlatformFeeDollars, getOptionPriceDollars } from "./pricing";
import { WebBookingStepActions } from "./WebBookingStepActions";

/** Motifs de refus de POST /bookings, en français (aligné app mobile). */
const BOOKING_ERROR_MESSAGES: Record<string, string> = {
  SLOT_NOT_AVAILABLE:
    "Ce créneau n'est plus disponible. Revenez au choix du créneau.",
  NO_STAFF_AVAILABLE:
    "Plus aucune professionnelle n'est disponible sur ce créneau. Revenez au choix du créneau.",
  STAFF_UNAVAILABLE_BLOCK:
    "La professionnelle choisie n'est plus disponible sur ce créneau.",
  BOOKING_OUTSIDE_HOURS:
    "Ce créneau dépasse les horaires de la professionnelle. Revenez au choix du créneau.",
  BOOKING_AMOUNT_MISMATCH:
    "Les tarifs du salon ont changé depuis votre sélection. Revenez au choix des prestations.",
  BOOKING_SERVICE_NOT_FOUND:
    "Une des prestations choisies n'est plus proposée par ce salon.",
  BOOKING_SERVICE_OPTION_INVALID:
    "Une des options choisies n'est plus proposée par ce salon.",
  BOOKING_SERVICE_OPTION_REQUIRED:
    "Choisissez une option pour chaque prestation.",
  BOOKING_TOO_MANY_SERVICES:
    "Une réservation peut contenir 4 prestations au maximum.",
  BOOKING_DUPLICATE_SERVICE:
    "La même prestation ne peut pas être réservée deux fois.",
  BOOKING_LOCATION_INCOMPATIBLE:
    "Ces prestations ne peuvent pas être réalisées au même endroit.",
  BOOKING_DURATION_TOO_LONG:
    "La durée totale des prestations dépasse 12 heures.",
};

interface WebBookingPayPanelProps {
  salonId: string;
  salonOffersHomeService: boolean;
  province: string;
  clientId: string;
  clientEmail: string;
  locale: string;
  /** Toutes les prestations choisies, dans l'ordre d'enchaînement. */
  lines: WebBookingSelectedService[];
  selectedSlot: SalonBookingTimeSlot;
  assignmentMode: WebBookingAssignmentMode;
  employeeId?: string;
  commissionRate: number;
  isHomeService: boolean;
  homeServiceAddress: AddressData | null;
  clientNotes?: string;
  referencePhotoFile?: File | null;
  referencePhotoPreview?: string | null;
  onBack?: () => void;
  backLabel?: string;
}

export function WebBookingPayPanel({
  salonId,
  salonOffersHomeService,
  province,
  clientId,
  clientEmail,
  locale,
  lines,
  selectedSlot,
  assignmentMode,
  employeeId,
  commissionRate,
  isHomeService,
  homeServiceAddress,
  clientNotes = "",
  referencePhotoFile = null,
  referencePhotoPreview = null,
  onBack,
  backLabel,
}: WebBookingPayPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [taxTotal, setTaxTotal] = useState<number | null>(null);
  const [taxLoading, setTaxLoading] = useState(true);

  const orderedLines = normalizeOrder(lines);
  // Prestations (réduction incluse) + un seul déplacement, le plus élevé
  const servicePrice = getServicesTotalDollars(orderedLines);
  const travelFeeDollars = getBookingTravelFeeDollars(
    orderedLines,
    isHomeService && salonOffersHomeService,
  );
  const clientSubtotalDollars =
    Math.round((servicePrice + travelFeeDollars) * 100) / 100;
  const durationMin = getTotalDurationMinutes(orderedLines);

  const platformFee = useMemo(
    () => computePlatformFeeDollars(clientSubtotalDollars, commissionRate),
    [clientSubtotalDollars, commissionRate],
  );

  useEffect(() => {
    let cancelled = false;
    setTaxLoading(true);
    (async () => {
      try {
        const res = await calculateTaxesApi({
          amount: platformFee,
          province,
        });
        const t = res?.data?.taxes?.totalTax;
        if (!cancelled) {
          setTaxTotal(typeof t === "number" ? t : 0);
        }
      } catch {
        if (!cancelled) setTaxTotal(0);
      } finally {
        if (!cancelled) setTaxLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [platformFee, province]);

  const totalAcompte = taxTotal != null ? platformFee + taxTotal : null;
  const trimmedNotes = clientNotes.trim();
  const hasClientRemarks = trimmedNotes.length > 0 || !!referencePhotoFile;

  const handlePay = async () => {
    if (!clientEmail.trim()) {
      setError(
        "Votre compte n'a pas d'email : ajoutez-en un dans votre profil ou reconnectez-vous.",
      );
      return;
    }
    if (
      isHomeService &&
      (!homeServiceAddress?.formattedAddress || !homeServiceAddress.street)
    ) {
      setError(
        "Adresse à domicile manquante : retournez à l’étape créneau pour la renseigner.",
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const bookingRes = await createBookingApi({
        clientId,
        salonId,
        appointmentStartDateTime: selectedSlot.startDateTime,
        duration: durationMin,
        isHomeService,
        clientBookingSubtotalDollars: Number(clientSubtotalDollars.toFixed(2)),
        // Une ligne par prestation, dans l'ordre ; déplacement sur la première
        services: buildBookingServicesPayload(
          orderedLines,
          isHomeService && salonOffersHomeService,
        ),
        assignmentMode,
        ...(trimmedNotes ? { clientNotes: trimmedNotes } : {}),
        ...(assignmentMode === "SPECIFIC_EMPLOYEE" && employeeId
          ? { employeeId }
          : {}),
        ...(isHomeService &&
          homeServiceAddress && {
            serviceAddress: {
              street: homeServiceAddress.street,
              city: homeServiceAddress.city,
              postalCode: homeServiceAddress.postalCode,
              country: homeServiceAddress.country,
              latitude: homeServiceAddress.latitude,
              longitude: homeServiceAddress.longitude,
              formattedAddress: homeServiceAddress.formattedAddress,
            },
          }),
      });

      const bookingPayload = bookingRes as {
        success?: boolean;
        data?: { id?: string };
        error?: { message?: string };
        message?: string;
      };

      if (!bookingPayload?.success || !bookingPayload?.data?.id) {
        const msg =
          bookingPayload?.error?.message ||
          bookingPayload?.message ||
          "Création de la réservation impossible.";
        setError(typeof msg === "string" ? msg : "Erreur réservation.");
        return;
      }

      const bookingId = bookingPayload.data.id;

      if (referencePhotoFile) {
        const photoRes = await uploadBookingPhotoApi(
          bookingId,
          referencePhotoFile,
        );
        const photoPayload = photoRes as { success?: boolean };
        if (!photoPayload?.success) {
          console.error(
            "❌ Upload photo de référence échoué, poursuite du paiement",
          );
        }
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const successUrl = `${origin}/${locale}/salon/${salonId}/booking-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/${locale}/salon/${salonId}`;

      const checkoutRes = await createCheckoutSessionApi({
        bookingId,
        amount: platformFee,
        province,
        customerEmail: clientEmail,
        successUrl,
        cancelUrl,
      });

      const checkoutPayload = checkoutRes as {
        success?: boolean;
        data?: { sessionUrl?: string };
        message?: string;
      };

      const url = checkoutPayload?.data?.sessionUrl;
      if (!checkoutPayload?.success || !url) {
        const msg = checkoutPayload?.message || "Paiement indisponible.";
        setError(typeof msg === "string" ? msg : "Erreur paiement.");
        return;
      }

      window.location.href = url;
    } catch (e: unknown) {
      // handleError (requestsConfig) relance l'erreur axios enrichie de
      // errorDetails.responseData = corps de la réponse serveur.
      const details = (
        e as {
          errorDetails?: { responseData?: Record<string, unknown> };
          formattedMessage?: string;
          message?: string;
        }
      )?.errorDetails?.responseData;
      const nested = details?.error as Record<string, unknown> | undefined;
      const errorCode = (details?.errorCode ?? nested?.errorCode) as
        | string
        | undefined;
      const serverMessage = (details?.message ?? nested?.message) as
        | string
        | undefined;
      setError(
        (errorCode && BOOKING_ERROR_MESSAGES[errorCode]) ||
          serverMessage ||
          (e as { formattedMessage?: string })?.formattedMessage ||
          (e as { message?: string })?.message ||
          "Une erreur est survenue. Réessayez.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2">
        <div>
          <span className="text-slate-500">
            {orderedLines.length > 1 ? "Prestations" : "Prestation"}
          </span>
          <ul className="mt-0.5 space-y-0.5">
            {orderedLines.map((line) => (
              <li key={line.service.id} className="flex justify-between gap-3">
                <span className="font-semibold text-slate-900">
                  {line.service.name}
                  <span className="font-normal text-slate-500">
                    {" "}
                    · {line.option.name} ·{" "}
                    {formatDurationMinutes(line.service.duration ?? 0)}
                  </span>
                </span>
                <span className="font-medium tabular-nums shrink-0">
                  {getOptionPriceDollars(line.option).toFixed(2)} $
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p>
          <span className="text-slate-500">Créneau</span>
          <br />
          <span className="font-medium">
            {selectedSlot.startTime} – {selectedSlot.endTime}
          </span>
        </p>
        <p>
          <span className="text-slate-500">Lieu</span>
          <br />
          <span className="font-medium">
            {isHomeService
              ? homeServiceAddress?.formattedAddress || "À domicile"
              : "Au salon"}
          </span>
        </p>
        {hasClientRemarks && (
          <div className="rounded-lg border border-[#53745D]/20 bg-[#F0F4F1]/60 p-3 space-y-2">
            <p className="text-xs font-semibold text-[#3a5a47] uppercase tracking-wide">
              Remarques pour la prestation
            </p>
            {trimmedNotes && (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {trimmedNotes}
              </p>
            )}
            {referencePhotoPreview && (
              <Image
                src={referencePhotoPreview}
                alt="Photo de référence"
                width={320}
                height={160}
                unoptimized
                className="w-full max-w-[200px] h-24 object-cover rounded-lg border border-slate-200"
              />
            )}
          </div>
        )}
        <div className="border-t border-slate-200 pt-2 mt-2 space-y-1">
          <div className="flex justify-between">
            <span>
              {formatServicesCount(orderedLines.length)} ·{" "}
              {formatDurationMinutes(durationMin)}
            </span>
            <span className="font-medium">{servicePrice.toFixed(2)} $</span>
          </div>
          {isHomeService && travelFeeDollars > 0 && (
            <div className="flex justify-between text-sm">
              <span>Déplacement à domicile</span>
              <span className="font-medium">
                {travelFeeDollars.toFixed(2)} $
              </span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-slate-100">
            <span className="font-medium text-slate-800">Total</span>
            <span className="font-semibold">
              {taxLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : totalAcompte != null ? (
                `${(clientSubtotalDollars + totalAcompte).toFixed(2)} $`
              ) : (
                `${(clientSubtotalDollars + platformFee).toFixed(2)} $`
              )}
            </span>
          </div>
          <div className="flex justify-between gap-3 pt-1 border-t border-slate-200">
            <div className="min-w-0">
              <span className="text-slate-900 font-semibold">
                À payer maintenant
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Frais plateforme ({Math.round(commissionRate * 100)}&nbsp;%) +
                taxes
                {province ? ` (${province})` : ""}
              </p>
            </div>
            <span className="font-semibold text-slate-900 tabular-nums shrink-0 self-start">
              {taxLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : totalAcompte != null ? (
                `${totalAcompte.toFixed(2)} $`
              ) : (
                "—"
              )}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Le solde de la prestation est dû au salon le jour du rendez-vous. Vous
        serez redirigé vers Stripe pour régler l&apos;acompte en toute sécurité.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <WebBookingStepActions onBack={onBack} backLabel={backLabel}>
        <Button
          type="button"
          className="flex-1"
          disabled={loading || taxLoading || totalAcompte == null}
          onClick={handlePay}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : (
            "Payer l'acompte"
          )}
        </Button>
      </WebBookingStepActions>
    </div>
  );
}
