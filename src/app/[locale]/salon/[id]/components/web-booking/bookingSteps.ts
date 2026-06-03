import { getBookingLocationMode } from "./bookingLocation";
import type { WebBookingServicePayload, WebBookingStep } from "./types";

const STEP_LABELS: Record<WebBookingStep, string> = {
  auth: "Compte",
  service: "Prestation",
  location: "Lieu",
  slot: "Créneau",
  notes: "Remarques",
  pay: "Paiement",
};

const STEP_TITLES: Record<WebBookingStep, string> = {
  auth: "Votre compte",
  service: "Prestation",
  location: "Lieu du rendez-vous",
  slot: "Date et créneau",
  notes: "Remarques pour la coiffeuse",
  pay: "Paiement de l'acompte",
};

export function showWebBookingLocationStep(
  salonOffersHomeService: boolean,
  service: WebBookingServicePayload | null,
): boolean {
  if (!service) return false;
  return (
    getBookingLocationMode(
      salonOffersHomeService,
      service.availableLocations,
    ) !== "salon_only"
  );
}

/** Prestation → lieu? → créneau → remarques → compte? → paiement (auth skip si déjà connecté). */
export function buildWebBookingSteps(
  salonOffersHomeService: boolean,
  service: WebBookingServicePayload | null,
  authenticated = false,
): WebBookingStep[] {
  const steps: WebBookingStep[] = ["service"];
  if (showWebBookingLocationStep(salonOffersHomeService, service)) {
    steps.push("location");
  }
  steps.push("slot", "notes");
  if (!authenticated) {
    steps.push("auth");
  }
  steps.push("pay");
  return steps;
}

export function getWebBookingStepLabel(step: WebBookingStep): string {
  return STEP_LABELS[step];
}

export function getWebBookingStepTitle(step: WebBookingStep): string {
  return STEP_TITLES[step];
}

export function getNextWebBookingStep(
  current: WebBookingStep,
  salonOffersHomeService: boolean,
  service: WebBookingServicePayload | null,
  authenticated = false,
): WebBookingStep | null {
  const steps = buildWebBookingSteps(
    salonOffersHomeService,
    service,
    authenticated,
  );
  const i = steps.indexOf(current);
  if (i < 0 || i >= steps.length - 1) return null;
  return steps[i + 1];
}

export function getPreviousWebBookingStep(
  current: WebBookingStep,
  salonOffersHomeService: boolean,
  service: WebBookingServicePayload | null,
  authenticated = false,
): WebBookingStep | null {
  const steps = buildWebBookingSteps(
    salonOffersHomeService,
    service,
    authenticated,
  );
  const i = steps.indexOf(current);
  if (i <= 0) return null;
  return steps[i - 1];
}
