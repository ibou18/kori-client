/**
 * Tests unitaires — pricing web-booking
 * Couvre : affichage prix, durée service (min/sec), arrondi cents et
 * commission plateforme. Le déplacement est couvert par bookingSelection.test.ts.
 */
import { describe, expect, it } from "vitest";
import {
  computePlatformFeeDollars,
  formatSalonPriceDollars,
  getOptionPriceDollars,
  getServiceDurationMinutes,
  roundUpToCent,
} from "./pricing";

// Affichage monétaire fr-CA (ex. 45,60)
describe("formatSalonPriceDollars", () => {
  it("formats with 2 decimals using fr-CA", () => {
    expect(formatSalonPriceDollars(45.6)).toBe("45,60");
  });
});

// API mobile : minutes si ≤ 2000, sinon secondes ; défaut 30, min 15
describe("getServiceDurationMinutes", () => {
  it("returns 30 by default when duration is missing or invalid", () => {
    expect(getServiceDurationMinutes()).toBe(30);
    expect(getServiceDurationMinutes(0)).toBe(30);
    expect(getServiceDurationMinutes(-5)).toBe(30);
  });

  it("treats values > 2000 as seconds", () => {
    expect(getServiceDurationMinutes(3600)).toBe(60);
  });

  it("treats values <= 2000 as minutes", () => {
    expect(getServiceDurationMinutes(45)).toBe(45);
  });

  it("enforces a minimum of 15 minutes", () => {
    expect(getServiceDurationMinutes(5)).toBe(15);
  });
});

// Arrondi commercial au centime supérieur
describe("roundUpToCent", () => {
  it("rounds up to the next cent", () => {
    expect(roundUpToCent(4.501)).toBe(4.51);
    expect(roundUpToCent(4.5)).toBe(4.5);
  });
});

// Prix option : promo prioritaire sur le prix régulier
describe("getOptionPriceDollars", () => {
  it("prefers the discount price", () => {
    expect(
      getOptionPriceDollars({ id: "1", name: "A", price: 50, discountPrice: 40 }),
    ).toBe(40);
  });

  it("falls back to the regular price", () => {
    expect(getOptionPriceDollars({ id: "1", name: "A", price: 50 })).toBe(50);
  });
});

// Commission Kori = prix × taux, arrondi au cent
describe("computePlatformFeeDollars", () => {
  it("computes platform fee rounded up to the cent", () => {
    expect(computePlatformFeeDollars(45, 0.1)).toBe(4.5);
    expect(computePlatformFeeDollars(33.33, 0.1)).toBe(3.34);
  });
});
