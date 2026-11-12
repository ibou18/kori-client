import { getCombinedAvailableLocations } from "./bookingLocation";
import type { WebBookingServicePayload, WebBookingStep } from "./types";

const STEP_LABELS: Record<WebBookingStep, string> = {
  auth: "Compte",
  service: "Prestation",
  location: "Lieu",
  slot: "Créneau",
  notes: "Remarques",
  pay: "Paiement",
};

/** Titres des étapes (maquette KAN-16), posés en police d'affichage du salon. */
const STEP_TITLES: Record<WebBookingStep, string> = {
  auth: "Vos coordonnées",
  service: "Sélectionnez votre prestation",
  location: "Où souhaitez-vous le rendez-vous\u00a0?",
  slot: "Quand souhaitez-vous venir\u00a0?",
  notes: "Un détail pour la prestataire\u00a0?",
  pay: "Paiement",
};

/**
 * L'étape lieu n'a de sens que si le domicile est possible pour TOUTES les
 * prestations choisies (et proposé par le salon).
 */
export function showWebBookingLocationStep(
  salonOffersHomeService: boolean,
  services: WebBookingServicePayload[],
): boolean {
  if (!salonOffersHomeService || services.length === 0) return false;
  return getCombinedAvailableLocations(services).includes("HOME_ONLY");
}

/** Prestations → lieu? → créneau → remarques → compte? → paiement (auth skip si déjà connecté). */
export function buildWebBookingSteps(
  salonOffersHomeService: boolean,
  services: WebBookingServicePayload[],
  authenticated = false,
): WebBookingStep[] {
  const steps: WebBookingStep[] = ["service"];
  if (showWebBookingLocationStep(salonOffersHomeService, services)) {
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
  services: WebBookingServicePayload[],
  authenticated = false,
): WebBookingStep | null {
  const steps = buildWebBookingSteps(
    salonOffersHomeService,
    services,
    authenticated,
  );
  const i = steps.indexOf(current);
  if (i < 0 || i >= steps.length - 1) return null;
  return steps[i + 1];
}

export function getPreviousWebBookingStep(
  current: WebBookingStep,
  salonOffersHomeService: boolean,
  services: WebBookingServicePayload[],
  authenticated = false,
): WebBookingStep | null {
  const steps = buildWebBookingSteps(
    salonOffersHomeService,
    services,
    authenticated,
  );
  const i = steps.indexOf(current);
  if (i <= 0) return null;
  return steps[i - 1];
}

export function getPreviousWebBookingStepLabel(
  current: WebBookingStep,
  salonOffersHomeService: boolean,
  services: WebBookingServicePayload[],
  authenticated = false,
): string | null {
  const previous = getPreviousWebBookingStep(
    current,
    salonOffersHomeService,
    services,
    authenticated,
  );
  return previous ? getWebBookingStepLabel(previous) : null;
}
