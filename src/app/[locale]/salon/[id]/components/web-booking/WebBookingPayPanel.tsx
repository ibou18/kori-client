"use client";

import {
  createBookingApi,
  createCheckoutSessionApi,
  quotePaymentApi,
  uploadBookingPhotoApi,
} from "@/app/data/services";
import type { AddressData } from "@/components/ui/GoogleAddressAutocomplete";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Info, Loader2, Lock, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { formatCents, readApiError } from "../../shop/format";
import { cartToOrderItems } from "../../shop/productCart";
import type { CartItem, PublicProduct } from "../../shop/types";

import type { SalonBookingTimeSlot, WebBookingAssignmentMode, WebBookingSelectedService } from "./types";
import {
  buildBookingServicesPayload,
  formatDurationMinutes,
  getBookingTravelFeeDollars,
  getServicesTotalDollars,
  getTotalDurationMinutes,
  normalizeOrder,
} from "./bookingSelection";
import { formatSalonPriceDollars, getOptionPriceDollars } from "./pricing";
import { WebBookingProductsDialog } from "./WebBookingProductsDialog";
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
  isHomeService: boolean;
  homeServiceAddress: AddressData | null;
  clientNotes?: string;
  referencePhotoFile?: File | null;
  referencePhotoPreview?: string | null;
  /** Produits à récupérer pendant le rendez-vous, payés en entier avec la réservation. */
  products?: CartItem[];
  /** Produits en vente du salon : permet de modifier le panier depuis cette étape (vide = boutique fermée). */
  shopProducts?: PublicProduct[];
  /** 0 = retirer. Requis avec `shopProducts`. */
  onSetProductQuantity?: (product: PublicProduct, quantity: number) => void;
}

/** Réponse de POST /payments/quote (montants en dollars), source unique des montants. */
interface PaymentQuote {
  paymentModel: "DEPOSIT" | "PLATFORM_FEE_ONLY";
  depositRate: number;
  commissionRate: number;
  depositAmount: number;
  platformFee: number;
  tax: number;
  productsAmount: number;
  onlineCharge: number;
  payOnSite: number;
}

const money = (v: number) => `${formatSalonPriceDollars(v)} $`;

/**
 * Étape paiement (maquette) : récapitulatif de la réservation, détail de ce qui
 * est payé maintenant (acompte éventuel, frais de service, produits) et de
 * ce qui reste dû au salon, puis redirection vers Stripe Checkout.
 * Les montants viennent du devis serveur (`POST /payments/quote`), calculé comme à
 * la création de la réservation : l'écran annonce exactement ce que Stripe débitera.
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
  isHomeService,
  homeServiceAddress,
  clientNotes = "",
  referencePhotoFile = null,
  referencePhotoPreview = null,
  products = [],
  shopProducts = [],
  onSetProductQuantity,
}: WebBookingPayPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feeInfoOpen, setFeeInfoOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const canEditProducts = shopProducts.length > 0 && !!onSetProductQuantity;

  const orderedLines = normalizeOrder(lines);
  const servicePrice = getServicesTotalDollars(orderedLines);
  const travelFeeDollars = getBookingTravelFeeDollars(orderedLines, isHomeService && salonOffersHomeService);
  const clientSubtotalDollars = Math.round((servicePrice + travelFeeDollars) * 100) / 100;
  const durationMin = getTotalDurationMinutes(orderedLines);

  const productItems = cartToOrderItems(products);
  const {
    data: quote,
    isFetching: quoteFetching,
    error: quoteError,
  } = useQuery({
    queryKey: ["web-booking-quote", salonId, clientSubtotalDollars, province, productItems],
    queryFn: async () => {
      const res = (await quotePaymentApi({
        salonId,
        subtotal: clientSubtotalDollars,
        province,
        ...(productItems.length ? { products: productItems } : {}),
      })) as { data?: PaymentQuote } | null;
      if (!res?.data) throw new Error("Devis indisponible");
      return res.data;
    },
    retry: false,
    // Panier modifié : on garde l'ancien devis affiché pendant le recalcul (pas de saut
    // de mise en page) ; total et bouton Payer restent en attente tant qu'il tourne.
    placeholderData: keepPreviousData,
  });
  const quoteErrorMessage = quoteError ? readApiError(quoteError, BOOKING_ERROR_MESSAGES).message : null;

  const payNow = quote?.onlineCharge ?? null;
  const taxLoading = quoteFetching;
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
        ...(productItems.length ? { products: productItems } : {}),
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
        // Indicatif : le serveur débite les montants enregistrés sur la réservation.
        amount: quote?.platformFee ?? 0,
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
      setError(readApiError(e, BOOKING_ERROR_MESSAGES).message);
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
            {quote && quote.depositAmount > 0 && (
              <Row
                label={`Acompte (${Math.round(quote.depositRate * 100)} % de la prestation)`}
                value={money(quote.depositAmount)}
              />
            )}
            <Row
              label={
                <>
                  Frais de service
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
              // Kori ne facture plus de taxes sur ses frais : `tax` vaut 0 ; additionné par
              // sécurité pour que les lignes affichées tombent toujours sur le total.
              value={quote ? money(quote.platformFee + quote.tax) : <Loader2 className="size-4 animate-spin" />}
            />
            {feeInfoOpen && (
              <div
                id="wb-fee-info"
                role="note"
                className="rounded-xl bg-site-accent px-3 py-2.5 text-[13px] leading-[1.45] text-site-on-accent"
              >
                Merci de votre confiance ! Ces frais de service
                {quote ? ` (${Math.round(quote.commissionRate * 100)} % du prix de la prestation)` : ""} font vivre
                korí : paiement sécurisé, rappels de rendez-vous et une équipe à votre écoute. Ils sont payés une seule
                fois, au moment de la réservation.
              </div>
            )}
          </div>

          {(products.length > 0 || canEditProducts) && (
            <div className="mt-1 flex flex-col gap-1.5 border-t border-site-border pt-2.5">
              {products.length > 0 ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold">Produits · payés en entier, à récupérer au salon</p>
                    {canEditProducts && (
                      <button
                        type="button"
                        onClick={() => setProductsOpen(true)}
                        disabled={loading}
                        className="-my-2 inline-flex min-h-11 shrink-0 items-center gap-1 text-[13px] font-semibold text-site-accent hover:underline disabled:opacity-50"
                      >
                        <Pencil className="size-3.5" />
                        Modifier
                      </button>
                    )}
                  </div>
                  {products.map((item) => (
                    <Row
                      key={item.productId}
                      label={`${item.name} × ${item.quantity}`}
                      value={formatCents(item.priceCents * item.quantity)}
                    />
                  ))}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setProductsOpen(true)}
                  disabled={loading}
                  className="-my-1 inline-flex min-h-11 items-center gap-1.5 self-start text-[13px] font-semibold text-site-accent hover:underline disabled:opacity-50"
                >
                  <Plus className="size-4" />
                  Ajouter des produits du salon
                </button>
              )}
            </div>
          )}

          <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-site-border pt-2.5">
            <span className="text-base font-bold">À payer maintenant</span>
            <span className="text-lg font-bold tabular-nums">
              {taxLoading || payNow == null ? <Loader2 className="size-4 animate-spin" /> : money(payNow)}
            </span>
          </div>
          <p className="text-[13px] text-site-muted">
            Reste à régler au salon le jour du rendez-vous : {money(quote?.payOnSite ?? clientSubtotalDollars)}
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
          Vous serez redirigé vers Stripe pour régler {quote && quote.depositAmount > 0 ? "l'acompte, " : ""}les frais de
          service{products.length ? " et vos produits" : ""}. Le solde de la prestation est dû au salon le jour du
          rendez-vous.
        </p>

        {quoteErrorMessage && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{quoteErrorMessage}</p>
        )}
        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>

      {canEditProducts && onSetProductQuantity && (
        <WebBookingProductsDialog
          open={productsOpen}
          onClose={() => setProductsOpen(false)}
          products={shopProducts}
          cartItems={products}
          onSetQuantity={onSetProductQuantity}
        />
      )}

      <WebBookingStepActions>
        <WebBookingCta type="button" disabled={loading || taxLoading || payNow == null || !!quoteError} onClick={handlePay}>
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
