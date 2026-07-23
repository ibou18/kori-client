/**
 * Tests unitaires — staff salon pour le web-booking
 * Couvre : parsing payload API, liste owner+employés dédupliquée,
 * détection d'équipe (choix pro).
 */
import { describe, expect, it } from "vitest";
import {
  buildWebBookingStaffOptions,
  parseSalonDetailPayload,
  salonHasTeamEmployees,
} from "./salonStaff";

// Réponse API enveloppe `{ data }` ou objet salon brut
describe("parseSalonDetailPayload", () => {
  it("returns null for invalid input", () => {
    expect(parseSalonDetailPayload(null)).toBeNull();
    expect(parseSalonDetailPayload("x")).toBeNull();
  });

  it("extracts data when present", () => {
    expect(parseSalonDetailPayload({ data: { id: "1", name: "Salon" } })).toEqual(
      { id: "1", name: "Salon" },
    );
  });

  it("returns the raw object otherwise", () => {
    expect(parseSalonDetailPayload({ id: "1" })).toEqual({ id: "1" });
  });
});

// Owner en premier, employés ensuite, ids uniques
describe("buildWebBookingStaffOptions", () => {
  it("returns [] without a salon", () => {
    expect(buildWebBookingStaffOptions(null)).toEqual([]);
  });

  it("adds owner then employees without duplicates", () => {
    const staff = buildWebBookingStaffOptions({
      owner: { id: "o1", firstName: "Alice", lastName: "Owner" },
      employees: [
        { id: "e1", firstName: "Bob", lastName: "Emp" },
        { id: "o1", firstName: "Alice", lastName: "Owner" },
        { id: "e2", firstName: "Cara" },
        null,
      ],
    });

    expect(staff).toEqual([
      { id: "o1", firstName: "Alice", lastName: "Owner" },
      { id: "e1", firstName: "Bob", lastName: "Emp" },
      { id: "e2", firstName: "Cara", lastName: "" },
    ]);
  });
});

// Afficher le sélecteur pro seulement s'il y a ≥ 1 employé
describe("salonHasTeamEmployees", () => {
  it("detects whether the salon has employees", () => {
    expect(salonHasTeamEmployees(null)).toBe(false);
    expect(salonHasTeamEmployees({ employees: [] })).toBe(false);
    expect(
      salonHasTeamEmployees({ employees: [{ id: "e1", firstName: "A" }] }),
    ).toBe(true);
  });
});
