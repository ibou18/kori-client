/**
 * Tests unitaires — étapes du flux web-booking
 * Couvre : visibilité étape lieu, construction du parcours,
 * libellés FR et navigation next/prev.
 */
import { describe, expect, it } from "vitest";
import {
  buildWebBookingSteps,
  getNextWebBookingStep,
  getPreviousWebBookingStep,
  getPreviousWebBookingStepLabel,
  getWebBookingStepLabel,
  getWebBookingStepTitle,
  showWebBookingLocationStep,
} from "./bookingSteps";
import type { WebBookingServicePayload } from "./types";

/** Service salon uniquement → pas d'étape location */
const salonOnlyService: WebBookingServicePayload = {
  id: "s1",
  name: "Coupe",
  availableLocations: ["SALON_ONLY"],
};

/** Service BOTH → étape location affichée */
const homeChoiceService: WebBookingServicePayload = {
  id: "s2",
  name: "Coiffure domicile",
  availableLocations: ["BOTH"],
};

// Étape « Lieu » seulement si mode ≠ salon_only
describe("showWebBookingLocationStep", () => {
  it("hides the location step without a service", () => {
    expect(showWebBookingLocationStep(true, null)).toBe(false);
  });

  it("hides the location step for salon only", () => {
    expect(showWebBookingLocationStep(true, salonOnlyService)).toBe(false);
  });

  it("shows the location step when place is a choice", () => {
    expect(showWebBookingLocationStep(true, homeChoiceService)).toBe(true);
  });
});

// Ordre : service → location? → slot → notes → auth? → pay
describe("buildWebBookingSteps", () => {
  it("builds base flow without location or auth when authenticated", () => {
    expect(buildWebBookingSteps(false, salonOnlyService, true)).toEqual([
      "service",
      "slot",
      "notes",
      "pay",
    ]);
  });

  it("includes location and auth for a guest with place choice", () => {
    expect(buildWebBookingSteps(true, homeChoiceService, false)).toEqual([
      "service",
      "location",
      "slot",
      "notes",
      "auth",
      "pay",
    ]);
  });
});

// Libellés UI court / titre d'étape
describe("getWebBookingStepLabel / Title", () => {
  it("returns French labels", () => {
    expect(getWebBookingStepLabel("slot")).toBe("Créneau");
    expect(getWebBookingStepTitle("pay")).toBe("Paiement de l'acompte");
  });
});

// Navigation linéaire dans la liste d'étapes construite
describe("getNextWebBookingStep / getPreviousWebBookingStep", () => {
  it("navigates to next and previous steps", () => {
    expect(
      getNextWebBookingStep("service", true, homeChoiceService, false),
    ).toBe("location");
    expect(
      getPreviousWebBookingStep("slot", true, homeChoiceService, false),
    ).toBe("location");
  });

  it("returns null at the ends of the flow", () => {
    expect(
      getPreviousWebBookingStep("service", false, salonOnlyService, true),
    ).toBeNull();
    expect(
      getNextWebBookingStep("pay", false, salonOnlyService, true),
    ).toBeNull();
  });

  it("returns the previous step label", () => {
    expect(
      getPreviousWebBookingStepLabel("slot", true, homeChoiceService, false),
    ).toBe("Lieu");
  });
});
