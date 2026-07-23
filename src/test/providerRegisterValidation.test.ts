/**
 * Unit tests — provider (salon) registration validation, payload transform,
 * and API error message mapping.
 */
import { describe, expect, it } from "vitest";
import {
  getProviderRegisterErrorMessage,
  transformFormDataToSalonPayload,
  validateProviderPersonalInfo,
  validateSalonInfoStep,
  type ProviderPersonalInfoInput,
  type ProviderRegisterFormPayload,
  type ProviderSalonInfoInput,
} from "../utils/providerRegisterValidation";

const validPersonal = (): ProviderPersonalInfoInput => ({
  email: "owner@salon.com",
  lastName: "Dupont",
  firstName: "Alice",
  phone: "(514) 555-1234",
  countryCode: "+1",
  password: "secret1",
  confirmPassword: "secret1",
  acceptTerms: true,
});

const validSalon = (): ProviderSalonInfoInput => ({
  salonName: "Studio Kori",
  services: ["HAIRDRESSER"],
  salonAddress: {
    street: "123 Rue Saint-Denis",
    city: "Montréal",
    postalCode: "H2X 1A1",
    country: "Canada",
  },
  extraOffer: "no",
  collectDeposit: "yes",
  salonImages: [{ name: "photo.jpg" }],
});

describe("validateProviderPersonalInfo", () => {
  it("accepts valid personal info", () => {
    expect(validateProviderPersonalInfo(validPersonal())).toBeNull();
  });

  it("requires email, names and phone", () => {
    expect(
      validateProviderPersonalInfo({ ...validPersonal(), email: "" }),
    ).toBe("L'email est requis");
    expect(
      validateProviderPersonalInfo({ ...validPersonal(), lastName: "" }),
    ).toBe("Le nom est requis");
    expect(
      validateProviderPersonalInfo({ ...validPersonal(), firstName: "" }),
    ).toBe("Le prénom est requis");
    expect(
      validateProviderPersonalInfo({ ...validPersonal(), phone: "" }),
    ).toBe("Le numéro de téléphone est requis");
  });

  it("rejects invalid phone format", () => {
    expect(
      validateProviderPersonalInfo({ ...validPersonal(), phone: "123" }),
    ).toContain("Format de téléphone invalide");
  });

  it("requires password length >= 6 and matching confirmation", () => {
    expect(
      validateProviderPersonalInfo({ ...validPersonal(), password: "abc" }),
    ).toBe("Le mot de passe doit contenir au moins 6 caractères");
    expect(
      validateProviderPersonalInfo({
        ...validPersonal(),
        confirmPassword: "other12",
      }),
    ).toBe("Les mots de passe ne correspondent pas");
  });

  it("requires accepting terms", () => {
    expect(
      validateProviderPersonalInfo({ ...validPersonal(), acceptTerms: false }),
    ).toBe("Vous devez accepter les conditions d'utilisation");
  });
});

describe("validateSalonInfoStep", () => {
  it("accepts valid salon info", () => {
    expect(validateSalonInfoStep(validSalon())).toBeNull();
  });

  it("requires salon name and at least one service", () => {
    expect(validateSalonInfoStep({ ...validSalon(), salonName: "" })).toBe(
      "Veuillez indiquer le nom de votre salon",
    );
    expect(validateSalonInfoStep({ ...validSalon(), services: [] })).toBe(
      "Veuillez sélectionner au moins un service",
    );
  });

  it("requires complete address fields", () => {
    expect(
      validateSalonInfoStep({ ...validSalon(), salonAddress: null }),
    ).toBe("L'adresse est requise");
    expect(
      validateSalonInfoStep({
        ...validSalon(),
        salonAddress: {
          street: "A",
          city: "",
          postalCode: "H2X",
          country: "Canada",
        },
      }),
    ).toBe("La ville est requise");
    expect(
      validateSalonInfoStep({
        ...validSalon(),
        salonAddress: {
          street: "A",
          city: "MTL",
          postalCode: "",
          country: "Canada",
        },
      }),
    ).toBe("Le code postal est requis");
  });

  it("requires extraOffer, collectDeposit and at least one image", () => {
    expect(
      validateSalonInfoStep({ ...validSalon(), extraOffer: "" }),
    ).toBe("Veuillez indiquer si vous proposez des services à domicile");
    expect(
      validateSalonInfoStep({ ...validSalon(), collectDeposit: "" }),
    ).toBe("Veuillez indiquer si vous souhaitez collecter un acompte");
    expect(
      validateSalonInfoStep({ ...validSalon(), salonImages: [] }),
    ).toBe("Veuillez ajouter au moins une photo de votre salon");
  });
});

describe("transformFormDataToSalonPayload", () => {
  const fullForm = (): ProviderRegisterFormPayload => ({
    ...validPersonal(),
    services: ["HAIRDRESSER", "CUSTOM_SERVICE"],
    extraOffer: "yes",
    collectDeposit: "no",
    salonName: "Studio Kori",
    salonDescription: "Salon de test",
    salonHours: [
      {
        id: "monday",
        name: "Lundi",
        enabled: true,
        openingTime: "09:00",
        closingTime: "18:00",
      },
      {
        id: "tuesday",
        name: "Mardi",
        enabled: false,
        openingTime: "09:00",
        closingTime: "18:00",
      },
    ],
    salonAddress: {
      street: "123 Rue Saint-Denis",
      city: "Montréal",
      postalCode: "H2X 1A1",
      country: "Canada",
      latitude: 45.5,
      longitude: -73.5,
    },
  });

  it("builds user, salon and openingHours payload", () => {
    const payload = transformFormDataToSalonPayload(fullForm());

    expect(payload.user).toMatchObject({
      email: "owner@salon.com",
      firstName: "Alice",
      lastName: "Dupont",
      phone: "+1(514) 555-1234",
      countryCode: "+1",
    });
    expect(payload.salon.salonTypes).toEqual(["HAIRDRESSER"]);
    expect(payload.salon.services).toEqual(["HAIRDRESSER", "CUSTOM_SERVICE"]);
    expect(payload.salon.address).toMatchObject({
      street: "123 Rue Saint-Denis",
      latitude: 45.5,
      longitude: -73.5,
    });
    expect(payload.openingHours.monday).toEqual({
      open: "09:00",
      close: "18:00",
    });
    expect(payload.openingHours.tuesday).toBeNull();
  });

  it("falls back to placeholder address when missing", () => {
    const payload = transformFormDataToSalonPayload({
      ...fullForm(),
      salonAddress: null,
    });
    expect(payload.salon.address).toEqual({
      street: "À définir",
      city: "À définir",
      postalCode: "À définir",
      country: "Canada",
    });
  });
});

describe("getProviderRegisterErrorMessage", () => {
  it("maps Prisma P2002 phone/email conflicts", () => {
    expect(
      getProviderRegisterErrorMessage({
        code: "P2002",
        meta: { target: ["phone"] },
      }),
    ).toContain("téléphone");
    expect(
      getProviderRegisterErrorMessage({
        response: {
          data: { prismaError: { code: "P2002", meta: { target: ["email"] } } },
        },
      }),
    ).toContain("email");
  });

  it("maps known errorCode values", () => {
    expect(
      getProviderRegisterErrorMessage({
        response: { data: { errorCode: "EMAIL_ALREADY_EXISTS" } },
      }),
    ).toContain("email");
    expect(
      getProviderRegisterErrorMessage({
        response: { data: { errorCode: "INVALID_PASSWORD" } },
      }),
    ).toContain("mot de passe");
  });

  it("detects unique constraint phrases in message text", () => {
    expect(
      getProviderRegisterErrorMessage({
        message: "Unique constraint failed on phone",
      }),
    ).toContain("téléphone");
  });

  it("falls back to a generic message", () => {
    expect(getProviderRegisterErrorMessage({})).toBe(
      "Une erreur est survenue. Veuillez réessayer.",
    );
  });
});
