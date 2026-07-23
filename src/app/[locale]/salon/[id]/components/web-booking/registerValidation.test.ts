/**
 * Tests unitaires — validation inscription client (quick auth booking)
 * Couvre : téléphone optionnel, E.164, noms (2–50 chars), messages d'erreur API.
 */
import { describe, expect, it } from "vitest";
import {
  getRegisterErrorMessage,
  phoneE164ForRegister,
  validateClientRegistrationNames,
  validateOptionalRegistrationPhone,
} from "./registerValidation";

// Téléphone optionnel : vide OK, sinon format pays requis
describe("validateOptionalRegistrationPhone", () => {
  it("accepts an empty field", () => {
    expect(validateOptionalRegistrationPhone("+1", "")).toBeNull();
    expect(validateOptionalRegistrationPhone("+1", "   ")).toBeNull();
  });

  it("rejects an invalid format", () => {
    const msg = validateOptionalRegistrationPhone("+1", "123");
    expect(msg).toContain("Format invalide");
  });

  it("accepts a valid CA number", () => {
    expect(validateOptionalRegistrationPhone("+1", "(514) 555-1234")).toBeNull();
  });
});

// Conversion pour l'API d'inscription
describe("phoneE164ForRegister", () => {
  it("builds an E.164 number", () => {
    expect(phoneE164ForRegister("+1", "(514) 555-1234")).toBe("+15145551234");
  });
});

// Aligné sur isValidName côté serveur (lettres, tiret, apostrophe)
describe("validateClientRegistrationNames", () => {
  it("accepts valid names", () => {
    expect(validateClientRegistrationNames("Marie-Ève", "O'Neil")).toBeNull();
  });

  it("rejects a first name that is too short", () => {
    expect(validateClientRegistrationNames("A", "Dupont")).toContain("Prénom");
  });

  it("rejects an invalid last name", () => {
    expect(validateClientRegistrationNames("Alice", "X")).toContain("Nom");
  });
});

// Priorité : details.message → details string → message → fallback
describe("getRegisterErrorMessage", () => {
  it("prioritizes details.message", () => {
    expect(
      getRegisterErrorMessage({
        response: { data: { details: { message: "Email déjà pris" } } },
      }),
    ).toBe("Email déjà pris");
  });

  it("uses details string or API message", () => {
    expect(
      getRegisterErrorMessage({
        response: { data: { details: "Erreur détails" } },
      }),
    ).toBe("Erreur détails");
    expect(
      getRegisterErrorMessage({
        response: { data: { message: "Erreur API" } },
      }),
    ).toBe("Erreur API");
  });

  it("falls back to a generic message", () => {
    expect(getRegisterErrorMessage({})).toBe("Erreur lors de l'inscription.");
  });
});
