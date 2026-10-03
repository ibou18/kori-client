/**
 * Tests unitaires — mode de lieu du rendez-vous
 * Détermine salon_only / home_only / choice selon les capacités
 * du salon et availableLocations du service.
 */
import { describe, expect, it } from "vitest";
import {
  getBookingLocationMode,
  getCombinedAvailableLocations,
  getServiceLocations,
} from "./bookingLocation";

describe("getBookingLocationMode", () => {
  it("forces salon_only when salon does not offer home service", () => {
    expect(getBookingLocationMode(false, ["HOME_ONLY"])).toBe("salon_only");
  });

  it("returns home_only when only home is available", () => {
    expect(getBookingLocationMode(true, ["HOME_ONLY"])).toBe("home_only");
  });

  it("returns choice when BOTH or salon + home", () => {
    expect(getBookingLocationMode(true, ["BOTH"])).toBe("choice");
    expect(getBookingLocationMode(true, ["SALON_ONLY", "HOME_ONLY"])).toBe(
      "choice",
    );
  });

  it("defaults to salon_only when locations are empty", () => {
    expect(getBookingLocationMode(true, null)).toBe("salon_only");
    expect(getBookingLocationMode(true, [])).toBe("salon_only");
    expect(getBookingLocationMode(true, ["SALON_ONLY"])).toBe("salon_only");
  });
});

// Lieux d'une prestation puis intersection sur plusieurs prestations
describe("getServiceLocations / getCombinedAvailableLocations", () => {
  it("drops home when the service has no travel fee", () => {
    expect(
      getServiceLocations({ availableLocations: ["BOTH"], travelFees: null }),
    ).toEqual(["SALON_ONLY"]);
    expect(
      getServiceLocations({ availableLocations: ["BOTH"], travelFees: 10 }),
    ).toEqual(["SALON_ONLY", "HOME_ONLY"]);
  });

  it("defaults to salon when locations are empty", () => {
    expect(getServiceLocations({ availableLocations: [], travelFees: 10 })).toEqual([
      "SALON_ONLY",
    ]);
  });

  it("intersects locations across services", () => {
    expect(
      getCombinedAvailableLocations([
        { availableLocations: ["SALON_ONLY", "HOME_ONLY"], travelFees: 10 },
        { availableLocations: ["SALON_ONLY"], travelFees: null },
      ]),
    ).toEqual(["SALON_ONLY"]);
    expect(
      getCombinedAvailableLocations([
        { availableLocations: ["HOME_ONLY"], travelFees: 10 },
        { availableLocations: ["SALON_ONLY"], travelFees: null },
      ]),
    ).toEqual([]);
    expect(getCombinedAvailableLocations([])).toEqual([]);
  });
});
