"use client";

import { getSalonApi, getSalonServicesApi } from "@/app/data/services";
import type { AddressData } from "@/components/ui/GoogleAddressAutocomplete";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { formatCents } from "../../shop/format";
import { useProductCart } from "../../shop/productCart";
import { useSalonProducts } from "../../shop/useSalonProducts";
import type { PublicProduct } from "../../shop/types";
import { getCombinedAvailableLocations } from "./bookingLocation";
import {
  canAddService,
  formatDurationMinutes,
  formatSelectionLabel,
  getServicesTotalDollars,
  getTotalDurationMinutes as getTotalDurationMinutesForFlow,
  lineFromService,
  normalizeOrder,
  servicesSignature,
} from "./bookingSelection";
import {
  buildWebBookingSteps,
  getNextWebBookingStep,
  getPreviousWebBookingStep,
  showWebBookingLocationStep,
} from "./bookingSteps";
import { ClientQuickAuthPanel } from "./ClientQuickAuthPanel";
import { formatSalonPriceDollars } from "./pricing";
import { buildWebBookingStaffOptions, parseSalonDetailPayload, salonHasTeamEmployees } from "./salonStaff";
import type {
  SalonBookingTimeSlot,
  WebBookingAssignmentMode,
  WebBookingSelectedService,
  WebBookingServicePayload,
  WebBookingStep,
} from "./types";
import { WebBookingAddServiceDialog } from "./WebBookingAddServiceDialog";
import { WebBookingHeader } from "./WebBookingHeader";
import { WebBookingLocationPanel } from "./WebBookingLocationPanel";
import { WebBookingNotesPanel } from "./WebBookingNotesPanel";
import { WebBookingPayPanel } from "./WebBookingPayPanel";
import { WebBookingProductsBlock } from "./WebBookingProductsBlock";
import { WebBookingServicePanel } from "./WebBookingServicePanel";
import { WebBookingSlotPanel } from "./WebBookingSlotPanel";
import type { WebBookingFooterSummary } from "./WebBookingStepActions";

/** Prestation de l'API `/salons/:id/services` → charge utile du flux. */
function toWebBookingServicePayload(raw: unknown): WebBookingServicePayload | null {
  const r = raw as Record<string, unknown> | null;
  if (!r || typeof r.id !== "string" || typeof r.name !== "string") return null;
  const options = Array.isArray(r.options)
    ? (r.options as Record<string, unknown>[])
        .filter((o) => o.isActive !== false && typeof o.id === "string")
        .map((o) => ({
          id: o.id as string,
          name: String(o.name ?? ""),
          price: Number(o.price ?? 0),
          discountPrice: o.discountPrice != null ? Number(o.discountPrice) : undefined,
        }))
    : [];
  return {
    id: r.id,
    name: r.name,
    description: typeof r.description === "string" ? r.description : undefined,
    particularities: typeof r.particularities === "string" ? r.particularities : undefined,
    duration: typeof r.duration === "number" ? r.duration : undefined,
    photos: Array.isArray(r.photos) ? (r.photos as { url: string; alt?: string }[]) : undefined,
    options,
    availableLocations: Array.isArray(r.availableLocations) ? (r.availableLocations as string[]) : undefined,
    travelFees: typeof r.travelFees === "number" ? r.travelFees : null,
    isActive: r.isActive !== false,
  };
}

export interface SalonWebBookingFlowProps {
  salonId: string;
  salonName: string;
  locale: string;
  salonProvince?: string;
  salonOffersHomeService?: boolean;
  service: WebBookingServicePayload | null;
  /** Lien de retour vers le profil du salon (bouton retour de la première étape). */
  backHref?: string;
}

/**
 * Parcours de réservation en ligne (maquette KAN-16) : prestation → [lieu] →
 * créneau → note → [compte] → paiement. Chaque étape est une page plein écran
 * (en-tête + barre de progression, contenu, barre d'action collée en bas), aux
 * couleurs et polices du salon via les variables `--site-*`.
 */
export function SalonWebBookingFlow({
  salonId,
  salonName,
  locale,
  salonProvince = "QC",
  salonOffersHomeService = false,
  service,
  backHref,
}: SalonWebBookingFlowProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const sessionUser = session?.user as { id?: string; email?: string | null } | undefined;

  const [step, setStep] = useState<WebBookingStep>("service");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  // Prestations ajoutées à la principale (2e à 4e), dans l'ordre de sélection
  const [additionalLines, setAdditionalLines] = useState<WebBookingSelectedService[]>([]);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SalonBookingTimeSlot | null>(null);
  const [isHomeService, setIsHomeService] = useState(false);
  const [homeServiceAddress, setHomeServiceAddress] = useState<AddressData | null>(null);
  const [slotPanelSessionKey, setSlotPanelSessionKey] = useState(0);
  const [assignmentMode, setAssignmentMode] = useState<WebBookingAssignmentMode>("FIRST_AVAILABLE");
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [clientNotes, setClientNotes] = useState("");
  const [referencePhotoFile, setReferencePhotoFile] = useState<File | null>(null);
  const [referencePhotoPreview, setReferencePhotoPreview] = useState<string | null>(null);

  // Boutique : produits du panier (page salon / fiche produit), payés avec la réservation.
  const cart = useProductCart(salonId);
  const { products: shopProducts } = useSalonProducts(salonId);
  // Sans boutique active (pas de Connect, produits retirés), le panier n'est pas envoyé.
  const cartItems = useMemo(
    () => cart.items.filter((item) => shopProducts.some((p) => p.id === item.productId)),
    [cart.items, shopProducts],
  );
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotalCents = cartItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  /** Quantité d'un produit dans le panier (0 = retiré), depuis l'étape paiement. */
  const setProductQuantity = (p: PublicProduct, quantity: number) => {
    if (quantity <= 0) cart.remove(p.id);
    else if (cart.has(p.id)) cart.setQuantity(p.id, quantity);
    else cart.add({ productId: p.id, name: p.name, priceCents: p.priceCents, imageUrl: p.mainPhotoUrl }, quantity);
  };

  const lastPageServiceIdRef = useRef<string | null>(null);
  const pageHistoryInitializedRef = useRef(false);

  const authenticated = status === "authenticated" && !!session?.user;

  const { data: salonDetailRaw } = useQuery({
    queryKey: ["web-booking-salon-detail", salonId],
    queryFn: () => getSalonApi(salonId),
    enabled: !!salonId,
    staleTime: 5 * 60_000,
  });

  const salonDetail = useMemo(() => parseSalonDetailPayload(salonDetailRaw), [salonDetailRaw]);

  // Prestations du salon, pour en ajouter d'autres à la réservation
  const { data: salonServicesRaw } = useQuery({
    queryKey: ["web-booking-salon-services", salonId],
    queryFn: () => getSalonServicesApi(salonId),
    enabled: !!salonId,
    staleTime: 60_000,
  });

  const salonServices = useMemo((): WebBookingServicePayload[] => {
    const raw = salonServicesRaw as { data?: unknown } | unknown[] | null;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: unknown })?.data)
        ? ((raw as { data: unknown[] }).data as unknown[])
        : [];
    return list.map(toWebBookingServicePayload).filter((s): s is WebBookingServicePayload => s !== null);
  }, [salonServicesRaw]);

  const staffOptions = useMemo(() => buildWebBookingStaffOptions(salonDetail), [salonDetail]);
  const hasEmployees = useMemo(() => salonHasTeamEmployees(salonDetail), [salonDetail]);

  const resetClientNotesState = () => {
    if (referencePhotoPreview?.startsWith("blob:")) URL.revokeObjectURL(referencePhotoPreview);
    setClientNotes("");
    setReferencePhotoFile(null);
    setReferencePhotoPreview(null);
  };

  const handlePhotoSelect = (file: File, previewUrl: string) => {
    if (referencePhotoPreview?.startsWith("blob:")) URL.revokeObjectURL(referencePhotoPreview);
    setReferencePhotoFile(file);
    setReferencePhotoPreview(previewUrl);
  };

  const handlePhotoRemove = () => {
    if (referencePhotoPreview?.startsWith("blob:")) URL.revokeObjectURL(referencePhotoPreview);
    setReferencePhotoFile(null);
    setReferencePhotoPreview(null);
  };

  useEffect(() => {
    if (!hasEmployees && assignmentMode !== "FIRST_AVAILABLE") {
      setAssignmentMode("FIRST_AVAILABLE");
      setEmployeeId(undefined);
      setSelectedSlot(null);
    }
  }, [hasEmployees, assignmentMode]);

  useEffect(() => {
    if (hasEmployees && assignmentMode === "SPECIFIC_EMPLOYEE" && !employeeId && staffOptions.length > 0) {
      setEmployeeId(staffOptions[0].id);
    }
  }, [hasEmployees, assignmentMode, employeeId, staffOptions]);

  // Réinitialiser quand la prestation chargée change
  useEffect(() => {
    if (!service?.id) return;
    if (lastPageServiceIdRef.current !== service.id) {
      lastPageServiceIdRef.current = service.id;
      pageHistoryInitializedRef.current = false;
      setSlotPanelSessionKey((k) => k + 1);
      setSelectedSlot(null);
      setAdditionalLines([]);
      setConditionsAccepted(false);
      setHomeServiceAddress(null);
      setAssignmentMode("FIRST_AVAILABLE");
      setEmployeeId(undefined);
      resetClientNotesState();
      setStep("service");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id]);

  useEffect(() => {
    if (!service?.options?.length) return;
    setSelectedOptionId(service.options.length === 1 ? service.options[0].id : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id, service?.options?.length]);

  const servicePayload = service;

  // Toutes les prestations choisies, principale en premier
  const selectedServices = useMemo(
    (): WebBookingServicePayload[] => (servicePayload ? [servicePayload, ...additionalLines.map((l) => l.service)] : []),
    [servicePayload, additionalLines],
  );
  const primaryOption = servicePayload?.options?.find((o) => o.id === selectedOptionId);
  const selectedLines = useMemo(
    (): WebBookingSelectedService[] =>
      servicePayload && primaryOption
        ? normalizeOrder([lineFromService(servicePayload, primaryOption, 1), ...additionalLines])
        : [],
    [servicePayload, primaryOption, additionalLines],
  );
  const selectionKey = servicesSignature(selectedLines);
  const selectionLabel = selectedLines.length > 1 ? formatSelectionLabel(selectedLines, 2) : servicePayload?.name ?? "";
  const totalDurationMin = getTotalDurationMinutesForFlow(selectedLines);

  const footerSummary: WebBookingFooterSummary | null = selectedLines.length
    ? {
        label: `${selectionLabel}${cartCount ? ` + ${cartCount} produit${cartCount > 1 ? "s" : ""}` : ""} · ${formatDurationMinutes(totalDurationMin)}${
          selectedSlot && step !== "slot" ? ` · ${selectedSlot.startTime}` : ""
        }`,
        price: formatCents(Math.round(getServicesTotalDollars(selectedLines) * 100) + cartTotalCents),
      }
    : null;

  // « Souvent pris avec … » : produits liés aux prestations choisies, pas encore au panier.
  const selectedServiceIds = selectedServices.map((s) => s.id);
  const productSuggestions = shopProducts
    .filter(
      (p) =>
        !cart.has(p.id) && p.recommendedServices.some((service) => selectedServiceIds.includes(service.id)),
    )
    .slice(0, 3);
  const suggestionFor = selectedServices.find((s) =>
    productSuggestions.some((p) => p.recommendedServices.some((r) => r.id === s.id)),
  );
  const productsBlock = (
    <WebBookingProductsBlock
      cartItems={cartItems}
      suggestions={productSuggestions}
      suggestionTitle={`Souvent pris avec : ${suggestionFor?.name ?? "cette prestation"}`}
      shopHref={`/${locale}/salon/${salonId}#boutique`}
      onRemove={cart.remove}
      onAdd={(p) =>
        cart.add({ productId: p.id, name: p.name, priceCents: p.priceCents, imageUrl: p.mainPhotoUrl })
      }
    />
  );

  const addServiceCheck = canAddService(selectedLines);
  const addServiceHelp = !primaryOption ? "Choisissez d'abord une formule" : addServiceCheck.ok ? null : addServiceCheck.message;

  // Lieu : domicile seulement s'il est possible pour toutes les prestations
  const combinedLocationsKey = getCombinedAvailableLocations(selectedServices).join("|");

  useEffect(() => {
    if (!service?.id) return;
    const combined = combinedLocationsKey.split("|").filter(Boolean);
    const canHome = salonOffersHomeService && combined.includes("HOME_ONLY");
    const canSalon = combined.includes("SALON_ONLY");
    if (canHome && !canSalon) {
      setIsHomeService(true);
    } else {
      setIsHomeService(false);
      setHomeServiceAddress(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id, salonOffersHomeService, combinedLocationsKey]);

  // Un créneau ne vaut que pour une sélection donnée (durée totale)
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectionKey, isHomeService, homeServiceAddress?.formattedAddress]);

  const bookingSteps = useMemo(
    () => buildWebBookingSteps(salonOffersHomeService, selectedServices, authenticated),
    [salonOffersHomeService, selectedServices, authenticated],
  );

  const needsLocationStep = showWebBookingLocationStep(salonOffersHomeService, selectedServices);

  const pushPageHistoryStep = useCallback((nextStep: WebBookingStep) => {
    window.history.pushState({ webBookingStep: nextStep }, "");
    window.scrollTo({ top: 0 });
  }, []);

  const goNext = useCallback(
    (from: WebBookingStep) => {
      const next = getNextWebBookingStep(from, salonOffersHomeService, selectedServices, authenticated);
      if (!next) return;
      setStep(next);
      pushPageHistoryStep(next);
    },
    [authenticated, pushPageHistoryStep, salonOffersHomeService, selectedServices],
  );

  const goBack = useCallback(
    (from: WebBookingStep) => {
      const prev = getPreviousWebBookingStep(from, salonOffersHomeService, selectedServices, authenticated);
      if (prev) {
        window.history.back();
        return;
      }
      if (backHref) router.push(backHref);
    },
    [authenticated, backHref, router, salonOffersHomeService, selectedServices],
  );

  /** Retour direct à l'étape prestation (lien « Modifier » du récapitulatif). */
  const goToService = useCallback(() => {
    setStep("service");
    pushPageHistoryStep("service");
  }, [pushPageHistoryStep]);

  useEffect(() => {
    if (step !== "location" || needsLocationStep) return;
    setStep("slot");
    pushPageHistoryStep("slot");
  }, [needsLocationStep, pushPageHistoryStep, step]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const historyStep = (event.state as { webBookingStep?: WebBookingStep } | null)?.webBookingStep;
      if (historyStep && bookingSteps.includes(historyStep)) setStep(historyStep);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [bookingSteps]);

  useEffect(() => {
    if (pageHistoryInitializedRef.current) return;
    window.history.replaceState({ webBookingStep: "service" }, "");
    pageHistoryInitializedRef.current = true;
  }, []);

  useEffect(() => {
    if (step === "auth" && authenticated) {
      setStep("pay");
      pushPageHistoryStep("pay");
    }
  }, [authenticated, pushPageHistoryStep, step]);

  useEffect(() => {
    if (step === "pay" && !authenticated) setStep("auth");
  }, [step, authenticated]);

  if (!servicePayload) return null;
  const payload = servicePayload;

  const isFirstStep = bookingSteps.indexOf(step) <= 0;
  const serviceContinueLabel = needsLocationStep ? "Continuer vers le lieu" : "Continuer vers le créneau";

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:min-h-0">
      <WebBookingHeader
        steps={bookingSteps}
        currentStep={step}
        salonName={salonName}
        onBack={isFirstStep ? undefined : () => goBack(step)}
        backHref={isFirstStep ? backHref : undefined}
        onSkip={step === "notes" ? () => goNext("notes") : undefined}
      />

      {step === "service" && (
        <WebBookingServicePanel
          service={payload}
          selectedOptionId={selectedOptionId}
          onSelectOption={(id) => {
            setSelectedOptionId(id);
            setSelectedSlot(null);
          }}
          selectedLines={selectedLines}
          additionalLines={additionalLines}
          onRemoveAdditional={(serviceId) =>
            setAdditionalLines((current) => normalizeOrder(current.filter((l) => l.service.id !== serviceId)))
          }
          onOpenAddService={() => setAddServiceOpen(true)}
          addServiceHelp={addServiceHelp}
          conditionsAccepted={conditionsAccepted}
          onConditionsAcceptedChange={setConditionsAccepted}
          onContinue={() => goNext("service")}
          continueLabel={serviceContinueLabel}
          summary={footerSummary}
        />
      )}

      <WebBookingAddServiceDialog
        open={addServiceOpen}
        onClose={() => setAddServiceOpen(false)}
        services={salonServices}
        selectedLines={selectedLines}
        onAdd={(line) => {
          setAdditionalLines((current) => normalizeOrder([...current, line]));
          setAddServiceOpen(false);
        }}
      />

      {step === "location" && selectedOptionId && (
        <WebBookingLocationPanel
          salonOffersHomeService={salonOffersHomeService}
          lines={selectedLines}
          isHomeService={isHomeService}
          onIsHomeServiceChange={(v) => {
            setIsHomeService(v);
            setSelectedSlot(null);
          }}
          homeServiceAddress={homeServiceAddress}
          onHomeServiceAddressChange={setHomeServiceAddress}
          onContinue={() => goNext("location")}
          summary={footerSummary}
        />
      )}

      {step === "slot" && selectedOptionId && (
        <WebBookingSlotPanel
          key={slotPanelSessionKey}
          salonId={salonId}
          durationMin={totalDurationMin}
          selectedOptionId={selectedOptionId}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          hasEmployees={hasEmployees}
          staffOptions={staffOptions}
          assignmentMode={assignmentMode}
          onAssignmentModeChange={setAssignmentMode}
          employeeId={employeeId}
          onEmployeeIdChange={setEmployeeId}
          onContinue={() => goNext("slot")}
          selectionTitle={selectionLabel}
          selectionMeta={`${formatDurationMinutes(totalDurationMin)} · ${formatSalonPriceDollars(getServicesTotalDollars(selectedLines))} $`}
          onEditSelection={goToService}
          summary={footerSummary}
          extra={productsBlock}
        />
      )}

      {step === "notes" && selectedSlot && (
        <WebBookingNotesPanel
          salonName={salonName}
          clientNotes={clientNotes}
          onClientNotesChange={setClientNotes}
          referencePhotoFile={referencePhotoFile}
          referencePhotoPreview={referencePhotoPreview}
          onPhotoSelect={handlePhotoSelect}
          onPhotoRemove={handlePhotoRemove}
          onContinue={() => goNext("notes")}
          summary={footerSummary}
        />
      )}

      {step === "auth" && selectedSlot && !authenticated && (
        <ClientQuickAuthPanel
          onAuthenticated={() => {
            setStep("pay");
            pushPageHistoryStep("pay");
          }}
          summary={footerSummary}
        />
      )}

      {step === "pay" && authenticated && sessionUser?.id && selectedOptionId && selectedSlot && (
        <WebBookingPayPanel
          salonId={salonId}
          salonOffersHomeService={salonOffersHomeService}
          province={(salonProvince || "QC").toUpperCase()}
          clientId={sessionUser.id}
          clientEmail={sessionUser.email ?? ""}
          locale={locale}
          lines={selectedLines}
          selectedSlot={selectedSlot}
          assignmentMode={assignmentMode}
          employeeId={assignmentMode === "SPECIFIC_EMPLOYEE" ? employeeId : undefined}
          isHomeService={isHomeService}
          homeServiceAddress={homeServiceAddress}
          clientNotes={clientNotes}
          referencePhotoFile={referencePhotoFile}
          referencePhotoPreview={referencePhotoPreview}
          products={cartItems}
          shopProducts={shopProducts}
          onSetProductQuantity={setProductQuantity}
        />
      )}
    </div>
  );
}
