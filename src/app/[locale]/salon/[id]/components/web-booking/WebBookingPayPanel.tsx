"use client";

import {
  calculateTaxesApi,
  createBookingApi,
  createCheckoutSessionApi,
  uploadBookingPhotoApi,
} from "@/app/data/services";
import type { AddressData } from "@/components/ui/GoogleAddressAutocomplete";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Info, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { SalonBookingTimeSlot, WebBookingAssignmentMode, WebBookingSelectedService } from "./types";
import {
  buildBookingServicesPayload,
  formatDurationMinutes,
  getBookingTravelFeeDollars,
  getServicesTotalDollars,
  getTotalDurationMinutes,
  normalizeOrder,
} from "./bookingSelection";
import { computePlatformFeeDollars, formatSalonPriceDollars, getOptionPriceDollars } from "./pricing";
import { WebBookingCta, WebBookingStepActions } from "./WebBookingStepActions";

/** Motifs de refus de POST /bookings, en français (aligné app mobile). */
const BOOKING_ERROR_MESSAGES: Record<string, string> = {
  SLOT_NOT_AVAILABLE: "Ce créneau n'est plus disponible. Revenez au choix du créneau.",
  NO_STAFF_AVAILABLE: "Plus aucune professionnelle n'est disponible sur ce créneau. Revenez au choix du créneau.",
  STAFF_UNAVAILABLE_BLOCK: "La professionnelle choisie n'est plus disponible sur ce créneau.",
  BOOKING_OUTSIDE_HOURS: "Ce créneau dépasse les horaires de la professionnelle. Revenez au choix du créneau.",
  BOOKING_AMOUNT_MISMATCH: "Les tarifs du salon ont changé depuis votre sélection. Revenez au choix des prestations.",
  BOOKING_SERVICE_NOT_FOUND: "Une des prestations choisies n'est plus proposée par ce salon.",
  BOOKING_SERVICE_OPTION_INVALID: "Une des options choisies n'est plus proposée par ce salon.",
  BOOKING_SERVICE_OPTION_REQUIRED: "Choisissez une option pour chaque prestation.",
  BOOKING_TOO_MANY_SERVICES: "Une réservation peut contenir 4 prestations au maximum.",
  BOOKING_DUPLICATE_SERVICE: "La même prestation ne peut pas être réservée deux fois.",
  BOOKING_LOCATION_INCOMPATIBLE: "Ces prestations ne peuvent pas être réalisées au même endroit.",
  BOOKING_DURATION_TOO_LONG: "La durée totale des prestations dépasse 12 heures.",
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
}

const money = (v: number) => `${formatSalonPriceDollars(v)} $`;

/**
 * Étape paiement (maquette) : récapitulatif de la réservation, détail de ce qui
 * est payé maintenant (frais de service + taxes) et de ce qui reste dû au salon,
 * puis redirection vers Stripe Checkout.
 */
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
}: WebBookingPayPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [taxTotal, setTaxTotal] = useState<number | null>(null);
  const [taxLoading, setTaxLoading] = useState(true);
  const [feeInfoOpen, setFeeInfoOpen] = useState(false);

  const orderedLines = normalizeOrder(lines);
  const servicePrice = getServicesTotalDollars(orderedLines);
  const travelFeeDollars = getBookingTravelFeeDollars(orderedLines, isHomeService && salonOffersHomeService);
  const clientSubtotalDollars = Math.round((servicePrice + travelFeeDollars) * 100) / 100;
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
        const res = await calculateTaxesApi({ amount: platformFee, province });
        const t = res?.data?.taxes?.totalTax;
        if (!cancelled) setTaxTotal(typeof t === "number" ? t : 0);
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

  const payNow = taxTotal != null ? Math.round((platformFee + taxTotal) * 100) / 100 : null;
  const trimmedNotes = clientNotes.trim();
  const hasClientRemarks = trimmedNotes.length > 0 || !!referencePhotoFile;
  const slotDate = new Date(selectedSlot.startDateTime);
  const slotLabel = Number.isNaN(slotDate.getTime())
    ? `${selectedSlot.startTime} – ${selectedSlot.endTime}`
    : `${format(slotDate, "EEE d MMM", { locale: fr })} à ${selectedSlot.startTime} · ${formatDurationMinutes(durationMin)}`;

  const handlePay = async () => {
    if (!clientEmail.trim()) {
      setError("Votre compte n'a pas d'email : ajoutez-en un dans votre profil ou reconnectez-vous.");
      return;
    }
    if (isHomeService && (!homeServiceAddress?.formattedAddress || !homeServiceAddress.street)) {
      setError("Adresse à domicile manquante : retournez à l'étape lieu pour la renseigner.");
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
        services: buildBookingServicesPayload(orderedLines, isHomeService && salonOffersHomeService),
        assignmentMode,
        ...(trimmedNotes ? { clientNotes: trimmedNotes } : {}),
        ...(assignmentMode === "SPECIFIC_EMPLOYEE" && employeeId ? { employeeId } : {}),
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
        const msg = bookingPayload?.error?.message || bookingPayload?.message || "Création de la réservation impossible.";
        setError(typeof msg === "string" ? msg : "Erreur réservation.");
        return;
      }

      const bookingId = bookingPayload.data.id;

      if (referencePhotoFile) {
        const photoRes = await uploadBookingPhotoApi(bookingId, referencePhotoFile);
        if (!(photoRes as { success?: boolean })?.success) {
          console.error("❌ Upload photo de référence échoué, poursuite du paiement");
        }
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
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

      const checkoutPayload = checkoutRes as { success?: boolean; data?: { sessionUrl?: string }; message?: string };
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
      const details = (e as { errorDetails?: { responseData?: Record<string, unknown> } })?.errorDetails?.responseData;
      const nested = details?.error as Record<string, unknown> | undefined;
      const errorCode = (details?.errorCode ?? nested?.errorCode) as string | undefined;
      const serverMessage = (details?.message ?? nested?.message) as string | undefined;
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

  const Row = ({ label, value, muted = true, className }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean; className?: string }) => (
    <div className={cn("flex items-center justify-between gap-3", muted && "text-site-fg-2", className)}>
      <span className="flex min-w-0 items-center gap-0.5">{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );

  return (
    <>
      <div className="flex flex-1 flex-col gap-[18px] px-5 pb-5 pt-5">
        <div className="flex flex-col gap-1.5 rounded-2xl border border-site-border bg-site-surface-2 px-4 py-3.5 text-sm">
          {orderedLines.map((line) => (
            <Row
              key={line.service.id}
              muted={false}
              label={
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-semibold">{line.service.name}</span>
                  {orderedLines.length > 1 || line.option.name ? (
                    <span className="text-[13px] text-site-muted">
                      {[line.option.name, formatDurationMinutes(line.service.duration ?? 0)].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </span>
              }
              value={money(getOptionPriceDollars(line.option))}
            />
          ))}
          <p className="text-site-fg-2">{slotLabel}</p>
          <p className="text-site-fg-2">
            {isHomeService ? homeServiceAddress?.formattedAddress || "À domicile" : "Au salon"}
          </p>

          <div className="mt-1 flex flex-col gap-1.5 border-t border-site-border pt-2.5">
            {isHomeService && travelFeeDollars > 0 && <Row label="Déplacement à domicile" value={money(travelFeeDollars)} />}
            <Row
              label={
                <>
                  Frais de service ({Math.round(commissionRate * 100)} %)
                  <button
                    type="button"
                    onClick={() => setFeeInfoOpen((v) => !v)}
                    aria-expanded={feeInfoOpen}
                    aria-controls="wb-fee-info"
                    aria-label="En savoir plus sur les frais de service"
                    className="-my-1.5 grid size-8 place-items-center text-site-muted"
                  >
                    <Info className="size-4" />
                  </button>
                </>
              }
              value={money(platformFee)}
            />
            {feeInfoOpen && (
              <div
                id="wb-fee-info"
                role="note"
                className="rounded-xl bg-site-accent px-3 py-2.5 text-[13px] leading-[1.45] text-site-on-accent"
              >
                Ces frais couvrent le paiement sécurisé et le fonctionnement de korí. Ils sont payés une seule fois,
                au moment de la réservation.
              </div>
            )}
            <Row
              label={`Taxes${province ? ` (${province})` : ""}`}
              value={taxLoading ? <Loader2 className="size-4 animate-spin" /> : money(taxTotal ?? 0)}
            />
          </div>

          <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-site-border pt-2.5">
            <span className="text-base font-bold">À payer maintenant</span>
            <span className="text-lg font-bold tabular-nums">
              {taxLoading || payNow == null ? <Loader2 className="size-4 animate-spin" /> : money(payNow)}
            </span>
          </div>
          <p className="text-[13px] text-site-muted">
            Reste à régler au salon le jour du rendez-vous : {money(clientSubtotalDollars)}
          </p>
        </div>

        {hasClientRemarks && (
          <div className="flex flex-col gap-2 rounded-2xl bg-site-surface-2 px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-site-muted">Votre note</p>
            {trimmedNotes && <p className="whitespace-pre-wrap text-sm text-site-fg-2">{trimmedNotes}</p>}
            {referencePhotoPreview && (
              <Image
                src={referencePhotoPreview}
                alt="Photo de référence"
                width={320}
                height={160}
                unoptimized
                className="h-24 w-full max-w-[200px] rounded-xl border border-site-border object-cover"
              />
            )}
          </div>
        )}

        <p className="text-[13px] text-site-muted">
          Vous serez redirigé vers Stripe pour régler les frais de service. Le solde de la prestation est dû au salon le
          jour du rendez-vous.
        </p>

        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>

      <WebBookingStepActions>
        <WebBookingCta type="button" disabled={loading || taxLoading || payNow == null} onClick={handlePay}>
          {loading ? <Loader2 className="size-5 animate-spin" /> : payNow != null ? `Payer ${money(payNow)}` : "Payer"}
        </WebBookingCta>
        <p className="flex items-center justify-center gap-1.5 text-xs text-site-muted">
          <Lock className="size-3.5" />
          Paiement sécurisé et chiffré par Stripe
        </p>
      </WebBookingStepActions>
    </>
  );
}
