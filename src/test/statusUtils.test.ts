/**
 * Tests unitaires — configs de statut (booking / payment / salon)
 * jsdom requis car le module importe des composants React (Badge).
 * On ne teste que les getters de config, pas les badges UI.
 */
/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import {
  getBookingStatusConfig,
  getPaymentStatusConfig,
  getSalonStatusConfig,
} from "../utils/statusUtils";

// Libellés / couleurs des statuts de rendez-vous
describe("getBookingStatusConfig", () => {
  it("returns known config", () => {
    expect(getBookingStatusConfig("CONFIRMED").label).toBe("Confirmée");
    expect(getBookingStatusConfig("PENDING").label).toBe("En attente");
  });

  it("falls back to the raw status", () => {
    expect(getBookingStatusConfig("CUSTOM").label).toBe("CUSTOM");
  });
});

// Libellés des statuts de paiement
describe("getPaymentStatusConfig", () => {
  it("returns payment labels", () => {
    expect(getPaymentStatusConfig("PAID").label).toBe("Payé");
    expect(getPaymentStatusConfig("PARTIALLY_PAID").label).toBe(
      "Partiellement payé",
    );
  });
});

// Priorité : inactif > non vérifié > actif
describe("getSalonStatusConfig", () => {
  it("prioritizes inactive then unverified then active", () => {
    expect(getSalonStatusConfig(false, true).label).toBe("Inactif");
    expect(getSalonStatusConfig(true, false).label).toBe("Non vérifié");
    expect(getSalonStatusConfig(true, true).label).toBe("Actif");
  });
});
