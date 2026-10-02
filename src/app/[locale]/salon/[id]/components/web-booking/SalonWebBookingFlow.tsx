"use client";

import { useGetPlatformConfig } from "@/app/data/hooks";
import { getSalonApi, getSalonServicesApi } from "@/app/data/services";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AddressData } from "@/components/ui/GoogleAddressAutocomplete";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getCombinedAvailableLocations } from "./bookingLocation";
import {
  canAddService,
  formatSelectionLabel,
  getTotalDurationMinutes as getTotalDurationMinutesForFlow,
  lineFromService,
  normalizeOrder,
  servicesSignature,
} from "./bookingSelection";
import {
  buildWebBookingSteps,
  getNextWebBookingStep,
  getPreviousWebBookingStep,
  getPreviousWebBookingStepLabel,
  getWebBookingStepTitle,
  showWebBookingLocationStep,
} from "./bookingSteps";
import { ClientQuickAuthPanel } from "./ClientQuickAuthPanel";
import {
  buildWebBookingStaffOptions,
  parseSalonDetailPayload,
  salonHasTeamEmployees,
} from "./salonStaff";
import { WebBookingStepProgress } from "./WebBookingStepProgress";
import { WebBookingTopNav } from "./WebBookingTopNav";
import { WebBookingAddServiceDialog } from "./WebBookingAddServiceDialog";
import { WebBookingLocationPanel } from "./WebBookingLocationPanel";
import { WebBookingNotesPanel } from "./WebBookingNotesPanel";
import { WebBookingParticularitiesDialog } from "./WebBookingParticularitiesDialog";
import { WebBookingPayPanel } from "./WebBookingPayPanel";
import { WebBookingServicePanel } from "./WebBookingServicePanel";
import { WebBookingSlotPanel } from "./WebBookingSlotPanel";
import type {
  SalonBookingTimeSlot,
  WebBookingAssignmentMode,
  WebBookingSelectedService,
  WebBookingServicePayload,
  WebBookingStep,
} from "./types";

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
          discountPrice:
            o.discountPrice != null ? Number(o.discountPrice) : undefined,
        }))
    : [];
  return {
    id: r.id,
    name: r.name,
    description: typeof r.description === "string" ? r.description : undefined,
    particularities:
      typeof r.particularities === "string" ? r.particularities : undefined,
    duration: typeof r.duration === "number" ? r.duration : undefined,
    photos: Array.isArray(r.photos)
      ? (r.photos as { url: string; alt?: string }[])
      : undefined,
    options,
    availableLocations: Array.isArray(r.availableLocations)
      ? (r.availableLocations as string[])
      : undefined,
    travelFees: typeof r.travelFees === "number" ? r.travelFees : null,
    isActive: r.isActive !== false,
  };
}

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
  const router = useRouter();
  const { data: session, status } = useSession();
  const sessionUser = session?.user as
    | { id?: string; email?: string | null }
    | undefined;
  const { data: platformConfigData } = useGetPlatformConfig();
  const commissionRate =
    platformConfigData?.data?.defaultCommissionRate ??
    platformConfigData?.defaultCommissionRate ??
    0.06;

  const [step, setStep] = useState<WebBookingStep>("service");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  // Prestations ajoutées à la principale (2e à 4e), dans l'ordre de sélection
  const [additionalLines, setAdditionalLines] = useState<
    WebBookingSelectedService[]
  >([]);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SalonBookingTimeSlot | null>(
    null,
  );
  const [isHomeService, setIsHomeService] = useState(false);
  const [homeServiceAddress, setHomeServiceAddress] =
    useState<AddressData | null>(null);
  const [slotPanelSessionKey, setSlotPanelSessionKey] = useState(0);
  const [assignmentMode, setAssignmentMode] =
    useState<WebBookingAssignmentMode>("FIRST_AVAILABLE");
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [clientNotes, setClientNotes] = useState("");
  const [particularitiesDialogOpen, setParticularitiesDialogOpen] =
    useState(false);
  const [referencePhotoFile, setReferencePhotoFile] = useState<File | null>(
    null,
  );
  const [referencePhotoPreview, setReferencePhotoPreview] = useState<
    string | null
  >(null);

  const wasDialogOpenRef = useRef(false);
  const lastPageServiceIdRef = useRef<string | null>(null);
  const pageHistoryInitializedRef = useRef(false);

  const authenticated = status === "authenticated" && !!session?.user;
  const active = variant === "page" || !!open;

  const { data: salonDetailRaw } = useQuery({
    queryKey: ["web-booking-salon-detail", salonId],
    queryFn: () => getSalonApi(salonId),
    enabled: !!salonId && active,
    staleTime: 5 * 60_000,
  });

  const salonDetail = useMemo(
    () => parseSalonDetailPayload(salonDetailRaw),
    [salonDetailRaw],
  );

  // Prestations du salon, pour en ajouter d'autres à la réservation
  const { data: salonServicesRaw } = useQuery({
    queryKey: ["web-booking-salon-services", salonId],
    queryFn: () => getSalonServicesApi(salonId),
    enabled: !!salonId && active,
    staleTime: 60_000,
  });

  const salonServices = useMemo((): WebBookingServicePayload[] => {
    const raw = salonServicesRaw as { data?: unknown } | unknown[] | null;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: unknown })?.data)
        ? ((raw as { data: unknown[] }).data as unknown[])
        : [];
    return list
      .map(toWebBookingServicePayload)
      .filter((s): s is WebBookingServicePayload => s !== null);
  }, [salonServicesRaw]);

  const staffOptions = useMemo(
    () => buildWebBookingStaffOptions(salonDetail),
    [salonDetail],
  );

  const hasEmployees = useMemo(
    () => salonHasTeamEmployees(salonDetail),
    [salonDetail],
  );

  const resetClientNotesState = () => {
    if (referencePhotoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(referencePhotoPreview);
    }
    setClientNotes("");
    setReferencePhotoFile(null);
    setReferencePhotoPreview(null);
  };

  const handlePhotoSelect = (file: File, previewUrl: string) => {
    if (referencePhotoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(referencePhotoPreview);
    }
    setReferencePhotoFile(file);
    setReferencePhotoPreview(previewUrl);
  };

  const handlePhotoRemove = () => {
    if (referencePhotoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(referencePhotoPreview);
    }
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
    if (
      hasEmployees &&
      assignmentMode === "SPECIFIC_EMPLOYEE" &&
      !employeeId &&
      staffOptions.length > 0
    ) {
      setEmployeeId(staffOptions[0].id);
    }
  }, [hasEmployees, assignmentMode, employeeId, staffOptions]);

  useEffect(() => {
    if (variant === "modal") {
      if (!open) {
        wasDialogOpenRef.current = false;
        return;
      }
      if (!wasDialogOpenRef.current) {
        setSlotPanelSessionKey((k) => k + 1);
        setSelectedSlot(null);
        setAdditionalLines([]);
        setHomeServiceAddress(null);
        setAssignmentMode("FIRST_AVAILABLE");
        setEmployeeId(undefined);
        resetClientNotesState();
        setStep("service");
        wasDialogOpenRef.current = true;
        return;
      }
      return;
    }

    // Page : réinitialiser quand la prestation chargée change
    if (!service?.id) return;
    if (lastPageServiceIdRef.current !== service.id) {
      lastPageServiceIdRef.current = service.id;
      pageHistoryInitializedRef.current = false;
      setSlotPanelSessionKey((k) => k + 1);
      setSelectedSlot(null);
      setAdditionalLines([]);
      setHomeServiceAddress(null);
      setAssignmentMode("FIRST_AVAILABLE");
      setEmployeeId(undefined);
      resetClientNotesState();
      setStep("service");
    }
  }, [variant, open, service?.id]);

  useEffect(() => {
    if (!active || !service?.options?.length) return;
    if (service.options.length === 1) {
      setSelectedOptionId(service.options[0].id);
    } else {
      setSelectedOptionId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, service?.id, service?.options?.length]);

  const servicePayload = useMemo((): WebBookingServicePayload | null => {
    if (!service) return null;
    return service;
  }, [service]);

  // Toutes les prestations choisies, principale en premier
  const selectedServices = useMemo(
    (): WebBookingServicePayload[] =>
      servicePayload
        ? [servicePayload, ...additionalLines.map((l) => l.service)]
        : [],
    [servicePayload, additionalLines],
  );
  const primaryOption = servicePayload?.options?.find(
    (o) => o.id === selectedOptionId,
  );
  const selectedLines = useMemo(
    (): WebBookingSelectedService[] =>
      servicePayload && primaryOption
        ? normalizeOrder([
            lineFromService(servicePayload, primaryOption, 1),
            ...additionalLines,
          ])
        : [],
    [servicePayload, primaryOption, additionalLines],
  );
  const selectionKey = servicesSignature(selectedLines);
  const selectionLabel =
    selectedLines.length > 1
      ? formatSelectionLabel(selectedLines, 3)
      : servicePayload?.name ?? "";

  const addServiceCheck = canAddService(selectedLines);
  const addServiceHelp = !primaryOption
    ? "Choisissez d'abord une option"
    : addServiceCheck.ok
      ? null
      : addServiceCheck.message;

  // Lieu : domicile seulement s'il est possible pour toutes les prestations
  const combinedLocationsKey = getCombinedAvailableLocations(
    selectedServices,
  ).join("|");

  useEffect(() => {
    if (!active || !service?.id) return;
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
  }, [active, service?.id, salonOffersHomeService, combinedLocationsKey]);

  // Un créneau ne vaut que pour une sélection donnée (durée totale)
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectionKey, isHomeService, homeServiceAddress?.formattedAddress]);

  const bookingSteps = useMemo(
    () =>
      buildWebBookingSteps(
        salonOffersHomeService,
        selectedServices,
        authenticated,
      ),
    [salonOffersHomeService, selectedServices, authenticated],
  );

  const title = getWebBookingStepTitle(step);

  const needsLocationStep = showWebBookingLocationStep(
    salonOffersHomeService,
    selectedServices,
  );

  const pushPageHistoryStep = useCallback((nextStep: WebBookingStep) => {
    if (variant !== "page") return;
    window.history.pushState({ webBookingStep: nextStep }, "");
  }, [variant]);

  const goNext = useCallback(
    (from: WebBookingStep) => {
      const next = getNextWebBookingStep(
        from,
        salonOffersHomeService,
        selectedServices,
        authenticated,
      );
      if (!next) return;
      setStep(next);
      pushPageHistoryStep(next);
    },
    [
      authenticated,
      pushPageHistoryStep,
      salonOffersHomeService,
      selectedServices,
    ],
  );

  const goBack = useCallback(
    (from: WebBookingStep) => {
      const prev = getPreviousWebBookingStep(
        from,
        salonOffersHomeService,
        selectedServices,
        authenticated,
      );
      if (prev) {
        if (variant === "page") {
          window.history.back();
          return;
        }
        setStep(prev);
        return;
      }
      if (backHref) {
        router.push(backHref);
      }
    },
    [
      authenticated,
      backHref,
      router,
      salonOffersHomeService,
      selectedServices,
      variant,
    ],
  );

  const previousStepLabel = getPreviousWebBookingStepLabel(
    step,
    salonOffersHomeService,
    selectedServices,
    authenticated,
  );

  const goBackSalon = () => {
    if (backHref) {
      router.push(backHref);
    }
  };

  const stepBackHandler =
    step === "service" ? undefined : () => goBack(step);
  const stepBackLabel = step === "service" ? undefined : "Retour";
  const serviceBackHandler = backHref ? goBackSalon : undefined;
  const serviceBackLabel = backHref ? "Retour au salon" : undefined;

  const serviceContinueLabel = needsLocationStep
    ? "Continuer vers le lieu"
    : "Continuer vers le créneau";

  useEffect(() => {
    if (!active || step !== "location" || needsLocationStep) return;
    setStep("slot");
    pushPageHistoryStep("slot");
  }, [active, needsLocationStep, pushPageHistoryStep, step]);

  useEffect(() => {
    if (variant !== "page" || !active) return;

    const onPopState = (event: PopStateEvent) => {
      const historyStep = (
        event.state as { webBookingStep?: WebBookingStep } | null
      )?.webBookingStep;

      if (historyStep && bookingSteps.includes(historyStep)) {
        setStep(historyStep);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [active, backHref, bookingSteps, router, variant]);

  useEffect(() => {
    if (variant !== "page" || !active || pageHistoryInitializedRef.current) {
      return;
    }

    window.history.replaceState({ webBookingStep: "service" }, "");
    pageHistoryInitializedRef.current = true;
  }, [active, variant]);

  useEffect(() => {
    if (step === "auth" && authenticated) {
      setStep("pay");
      pushPageHistoryStep("pay");
    }
  }, [authenticated, pushPageHistoryStep, step]);

  useEffect(() => {
    if (step === "pay" && !authenticated) {
      setStep("auth");
    }
  }, [step, authenticated]);

  if (variant === "modal" && !open) return null;
  if (!servicePayload) return null;
  const payload = servicePayload;

  const topNav = (
    <WebBookingTopNav
      previousStepLabel={previousStepLabel}
      onBackPrevious={
        previousStepLabel ? () => goBack(step) : undefined
      }
      backHref={backHref}
      className={variant === "modal" ? "-mt-1" : undefined}
    />
  );

  const stepProgress = (
    <WebBookingStepProgress
      steps={bookingSteps}
      currentStep={step}
      className="mt-4"
    />
  );

  const headerBlock =
    variant === "modal" ? (
      <DialogHeader>
        {topNav}
        <DialogTitle className="text-left pr-8">{title}</DialogTitle>
        <p className="text-sm text-slate-500 font-normal text-left">
          {salonName} — {selectionLabel}
        </p>
        {stepProgress}
      </DialogHeader>
    ) : (
      <header className="mb-8">
        {topNav}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Réservation en ligne
        </h1>
        <p className="text-slate-600 mt-1">
          {salonName} — {selectionLabel}
        </p>
        <p className="text-sm font-semibold text-slate-800 mt-6">
          {title}
        </p>
        {stepProgress}
      </header>
    );

  return (
    <>
      {headerBlock}

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
            setAdditionalLines((current) =>
              normalizeOrder(
                current.filter((l) => l.service.id !== serviceId),
              ),
            )
          }
          onOpenAddService={() => setAddServiceOpen(true)}
          addServiceHelp={addServiceHelp}
          onContinue={() => {
            if (payload.particularities?.trim()) {
              setParticularitiesDialogOpen(true);
              return;
            }
            goNext("service");
          }}
          continueLabel={serviceContinueLabel}
          onBack={serviceBackHandler}
          backLabel={serviceBackLabel}
          layoutVariant={variant}
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

      <WebBookingParticularitiesDialog
        open={particularitiesDialogOpen}
        particularities={payload.particularities?.trim() ?? ""}
        onCancel={() => setParticularitiesDialogOpen(false)}
        onConfirm={() => {
          setParticularitiesDialogOpen(false);
          goNext("service");
        }}
      />

      {step === "location" && selectedOptionId && (
        <>
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
            onBack={stepBackHandler}
            backLabel={stepBackLabel}
            layoutVariant={variant}
          />
        </>
      )}

      {step === "slot" && selectedOptionId && (
        <>
          <WebBookingSlotPanel
            key={slotPanelSessionKey}
            salonId={salonId}
            durationMin={getTotalDurationMinutesForFlow(selectedLines)}
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
            onBack={stepBackHandler}
            backLabel={stepBackLabel}
            layoutVariant={variant}
          />
        </>
      )}

      {step === "notes" && selectedSlot && (
        <>
          <WebBookingNotesPanel
            clientNotes={clientNotes}
            onClientNotesChange={setClientNotes}
            referencePhotoFile={referencePhotoFile}
            referencePhotoPreview={referencePhotoPreview}
            onPhotoSelect={handlePhotoSelect}
            onPhotoRemove={handlePhotoRemove}
            onContinue={() => goNext("notes")}
            onBack={stepBackHandler}
            backLabel={stepBackLabel}
          />
        </>
      )}

      {step === "auth" && selectedSlot && !authenticated && (
        <>
          <ClientQuickAuthPanel
            onBack={stepBackHandler}
            backLabel={stepBackLabel}
            onAuthenticated={() => {
              setStep("pay");
              pushPageHistoryStep("pay");
            }}
          />
        </>
      )}

      {step === "pay" &&
        authenticated &&
        sessionUser?.id &&
        selectedOptionId &&
        selectedSlot && (
          <>
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
              employeeId={
                assignmentMode === "SPECIFIC_EMPLOYEE" ? employeeId : undefined
              }
              commissionRate={commissionRate}
              isHomeService={isHomeService}
              homeServiceAddress={homeServiceAddress}
              clientNotes={clientNotes}
              referencePhotoFile={referencePhotoFile}
              referencePhotoPreview={referencePhotoPreview}
              onBack={stepBackHandler}
              backLabel={stepBackLabel}
            />
          </>
        )}
    </>
  );
}
