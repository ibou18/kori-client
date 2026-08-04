/**
 * Unit tests — landing-page prospect (quick register) validation
 * and API error message mapping.
 */
import { describe, expect, it } from "vitest";
import {
  getQuickRegisterErrorMessage,
  validateQuickRegisterForm,
} from "../utils/quickRegisterValidation";

describe("validateQuickRegisterForm", () => {
  it("returns no errors for a valid form", () => {
    expect(
      validateQuickRegisterForm({
        email: "prospect@kori.com",
        firstName: "Marie",
        lastName: "Tremblay",
        phone: "5145551234",
        services: ["HAIRDRESSER"],
      }),
    ).toEqual({});
  });

  it("flags invalid email, missing names, short phone and empty services", () => {
    expect(
      validateQuickRegisterForm({
        email: "bad",
        firstName: "  ",
        lastName: "",
        phone: "123",
        services: [],
      }),
    ).toEqual({
      email: "Email invalide",
      firstName: "Prénom requis",
      lastName: "Nom requis",
      phone: "Numéro de téléphone invalide",
      services: "Sélectionnez au moins un service",
    });
  });
});

describe("getQuickRegisterErrorMessage", () => {
  it("maps known error codes", () => {
    expect(
      getQuickRegisterErrorMessage({
        response: { data: { errorCode: "EMAIL_ALREADY_EXISTS" } },
      }),
    ).toContain("déjà enregistrée");
    expect(
      getQuickRegisterErrorMessage({ errorCode: "NETWORK_ERROR" }),
    ).toContain("connexion");
  });

  it("falls back to API or generic message", () => {
    expect(
      getQuickRegisterErrorMessage({
        response: { data: { message: "Erreur API" } },
      }),
    ).toBe("Erreur API");
    expect(getQuickRegisterErrorMessage({})).toBe(
      "Une erreur est survenue. Veuillez réessayer.",
    );
  });
});
