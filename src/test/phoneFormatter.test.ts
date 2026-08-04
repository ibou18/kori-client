/**
 * Tests unitaires — formatage / validation téléphone multi-pays
 * Couvre : format CA/FR, validation, placeholders, E.164 (dont 0 FR).
 */
import { describe, expect, it } from "vitest";
import {
  buildE164Phone,
  cleanPhoneNumber,
  formatPhoneNumber,
  getPhoneMaxLength,
  getPhonePlaceholder,
  validatePhoneNumber,
} from "../utils/phoneFormatter";

// Formatage progressif selon l'indicatif (+1, +33, …)
describe("formatPhoneNumber", () => {
  it("formats a CA number progressively", () => {
    expect(formatPhoneNumber("5145551234", "+1")).toBe("(514) 555-1234");
    expect(formatPhoneNumber("514", "+1")).toBe("514");
  });

  it("formats a FR number", () => {
    expect(formatPhoneNumber("0123456789", "+33")).toBe("01 23 45 67 89");
  });

  it("returns digits only for an unknown country", () => {
    expect(formatPhoneNumber("12-34", "+999")).toBe("1234");
  });
});

// Longueur + pattern par pays
describe("validatePhoneNumber", () => {
  it("validates CA / FR numbers", () => {
    expect(validatePhoneNumber("(514) 555-1234", "+1")).toBe(true);
    expect(validatePhoneNumber("01 23 45 67 89", "+33")).toBe(true);
    expect(validatePhoneNumber("123", "+1")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(validatePhoneNumber("", "+1")).toBe(false);
  });
});

// Métadonnées UI (placeholder input, maxlength)
describe("getPhonePlaceholder / getPhoneMaxLength", () => {
  it("returns country metadata", () => {
    expect(getPhonePlaceholder("+1")).toBe("(514) XXX-XXXX");
    expect(getPhoneMaxLength("+33")).toBe(10);
    expect(getPhoneMaxLength("+221")).toBe(9);
  });
});

// Strip non-digits
describe("cleanPhoneNumber", () => {
  it("keeps digits only", () => {
    expect(cleanPhoneNumber("(514) 555-1234")).toBe("5145551234");
    expect(cleanPhoneNumber("")).toBe("");
  });
});

// Format API E.164 (+1514…, +336… avec suppression du 0 national FR)
describe("buildE164Phone", () => {
  it("builds a CA E.164 number", () => {
    expect(buildE164Phone("+1", "(514) 555-1234")).toBe("+15145551234");
  });

  it("strips the FR national leading 0", () => {
    expect(buildE164Phone("+33", "06 12 34 56 78")).toBe("+33612345678");
  });

  it("returns undefined when empty", () => {
    expect(buildE164Phone("+1", "")).toBeUndefined();
  });
});
