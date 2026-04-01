"use client";

import {
  calculateTaxesApi,
  createBookingApi,
  createCheckoutSessionApi,
} from "@/app/data/services";
import type { AddressData } from "@/components/ui/GoogleAddressAutocomplete";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { SalonBookingTimeSlot, WebBookingServicePayload } from "./types";
import {
  computePlatformFeeDollars,
  getOptionPriceDollars,
  getServiceDurationMinutes,
} from "./pricing";

interface WebBookingPayPanelProps {
  salonId: string;
  province: string;
  clientId: string;
  clientEmail: string;
  locale: string;
  service: WebBookingServicePayload;
  selectedOptionId: string;
  selectedSlot: SalonBookingTimeSlot;
  commissionRate: number;
  isHomeService: boolean;
  homeServiceAddress: AddressData | null;
  onBack: () => void;
}

export function WebBookingPayPanel({
  salonId,
  province,
  clientId,
  clientEmail,
  locale,
  service,
  selectedOptionId,
  selectedSlot,
  commissionRate,
  isHomeService,
  homeServiceAddress,
  onBack,
}: WebBookingPayPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [taxTotal, setTaxTotal] = useState<number | null>(null);
  const [taxLoading, setTaxLoading] = useState(true);

  const option = service.options?.find((o) => o.id === selectedOptionId);
  const servicePrice = option ? getOptionPriceDollars(option) : 0;
  const travelFeeDollars = isHomeService
    ? (service.homeTravelFeeDollars ?? 0)
    : 0;
  const clientSubtotalDollars = servicePrice + travelFeeDollars;
  const durationMin = getServiceDurationMinutes(service.duration);

  const platformFee = useMemo(
    () => computePlatformFeeDollars(clientSubtotalDollars, commissionRate),
    [clientSubtotalDollars, commissionRate]
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

  const totalAcompte =
    taxTotal != null ? platformFee + taxTotal : null;

  const handlePay = async () => {
    if (!clientEmail.trim()) {
      setError(
        "Votre compte n'a pas d'email : ajoutez-en un dans votre profil ou reconnectez-vous."
      );
      return;
    }
    if (
      isHomeService &&
      (!homeServiceAddress?.formattedAddress || !homeServiceAddress.street)
    ) {
      setError(
        "Adresse à domicile manquante : retournez à l’étape créneau pour la renseigner."
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const serviceLine = {
        serviceId: service.id,
        serviceOptionId: selectedOptionId,
        optionId: selectedOptionId,
        quantity: 1,
        discountPrice: servicePrice,
      };

      const bookingRes = await createBookingApi({
        clientId,
        salonId,
        appointmentStartDateTime: selectedSlot.startDateTime,
        duration: durationMin,
        isHomeService,
        clientBookingSubtotalDollars: Number(clientSubtotalDollars.toFixed(2)),
        services: [serviceLine],
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
        const msg =
          checkoutPayload?.message || "Paiement indisponible.";
        setError(typeof msg === "string" ? msg : "Erreur paiement.");
        return;
      }

      window.location.href = url;
    } catch (e: unknown) {
      const msg =
        (e as { message?: string })?.message ||
        "Une erreur est survenue. Réessayez.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2">
        <p>
          <span className="text-slate-500">Prestation</span>
          <br />
          <span className="font-semibold text-slate-900">{service.name}</span>
        </p>
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
        <div className="border-t border-slate-200 pt-2 mt-2 space-y-1">
          <div className="flex justify-between">
            <span>Prestation</span>
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
            <span className="font-medium text-slate-800">Sous-total prestation</span>
            <span className="font-semibold">
              {clientSubtotalDollars.toFixed(2)} $
            </span>
          </div>
          <div className="flex justify-between gap-3 pt-1 border-t border-slate-200">
            <div className="min-w-0">
              <span className="text-slate-900 font-medium">
                Frais et taxes (acompte)
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Frais plateforme ({Math.round(commissionRate * 100)}&nbsp;%) + taxes
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

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={loading}
          onClick={onBack}
        >
          Retour
        </Button>
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
      </div>
    </div>
  );
}
