/**
 * Tests unitaires — payloads formulaire « mes services »
 * Couvre : buildCreate/UpdatePayload, formatHours, libellés catégorie/type.
 * Le hook React `useServiceForm` n'est pas testé ici.
 */
import { describe, expect, it } from "vitest";
import {
  EMPTY_FORM,
  buildCreatePayload,
  buildUpdatePayload,
  formatHours,
  getCategoryName,
  getSalonTypeText,
  type ServiceFormData,
} from "./serviceForm";

/** Fixture minimale d'un service salon (durée en heures côté form) */
const baseForm = (): ServiceFormData => ({
  ...EMPTY_FORM,
  name: "Coupe femme",
  duration: "1.5",
  description: "  Coupe + brushing  ",
  specifics: "  Cheveux longs  ",
  extension: "Incluse",
  availableLocations: ["SALON_ONLY"],
  group: "SIMPLE",
  options: [
    {
      id: "opt1",
      name: "Standard",
      regularPrice: "45",
      promoPrice: "40",
    },
  ],
});

// Create : durée heures→minutes, options, travelFees si HOME_ONLY
describe("buildCreatePayload", () => {
  it("builds create payload with duration in minutes", () => {
    const payload = buildCreatePayload(
      "salon-1",
      baseForm(),
      "cat-1",
      "HAIRDRESSER",
    );

    expect(payload).toMatchObject({
      salonId: "salon-1",
      name: "Coupe femme",
      categoryId: "cat-1",
      duration: 90,
      group: "SIMPLE",
      hasThicknessOptions: false,
      requiresExtensions: true,
      salonType: "HAIRDRESSER",
      particularities: "Cheveux longs",
      description: "Coupe + brushing",
      travelFees: undefined,
    });
    expect(payload.options).toEqual([
      {
        name: "Standard",
        price: 45,
        discountPrice: 40,
        thicknessOption: undefined,
        includesExtensions: true,
      },
    ]);
  });

  it("includes travelFees only for HOME_ONLY", () => {
    const form = {
      ...baseForm(),
      availableLocations: ["HOME_ONLY"] as const,
      travelFees: "15",
    };
    const payload = buildCreatePayload(
      "salon-1",
      form,
      "cat-1",
      "HAIRDRESSER",
    );
    expect(payload.travelFees).toBe(15);
  });
});

// Update : pas de salonId / salonType
describe("buildUpdatePayload", () => {
  it("omits salonId / salonType", () => {
    const payload = buildUpdatePayload(baseForm(), "cat-2");
    expect(payload).not.toHaveProperty("salonId");
    expect(payload).not.toHaveProperty("salonType");
    expect(payload.categoryId).toBe("cat-2");
    expect(payload.duration).toBe(90);
  });
});

// Affichage durée : "2h", "45min", "1h30"
describe("formatHours", () => {
  it("formats hours and minutes", () => {
    expect(formatHours(0)).toBe("0h");
    expect(formatHours(2)).toBe("2h");
    expect(formatHours(0.75)).toBe("45min");
    expect(formatHours(1.5)).toBe("1h30");
  });
});

// Normalisation affichage (string | objet category, enum salonType)
describe("getCategoryName / getSalonTypeText", () => {
  it("normalizes category and salon type", () => {
    expect(getCategoryName("Coiffure")).toBe("Coiffure");
    expect(getCategoryName({ name: "Barbier" })).toBe("Barbier");
    expect(getSalonTypeText("HAIRDRESSER")).toBe("Coiffure");
    expect(getSalonTypeText("CUSTOM")).toBe("CUSTOM");
  });
});
