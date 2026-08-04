/**
 * Unit tests — login credentials validation and error messages.
 */
import { describe, expect, it } from "vitest";
import {
  getLoginErrorMessage,
  validateLoginCredentials,
} from "../utils/loginValidation";

describe("validateLoginCredentials", () => {
  it("accepts valid email and password", () => {
    expect(
      validateLoginCredentials({
        email: "user@kori.com",
        password: "secret12",
      }),
    ).toBeNull();
  });

  it("rejects empty email", () => {
    expect(
      validateLoginCredentials({ email: "  ", password: "secret12" }),
    ).toBe("L'email est requis");
  });

  it("rejects invalid email format", () => {
    expect(
      validateLoginCredentials({ email: "not-an-email", password: "secret12" }),
    ).toBe("Format d'email invalide");
  });

  it("rejects empty password", () => {
    expect(
      validateLoginCredentials({ email: "user@kori.com", password: "   " }),
    ).toBe("Le mot de passe est requis");
  });
});

describe("getLoginErrorMessage", () => {
  it("maps CredentialsSignin to a friendly message", () => {
    expect(getLoginErrorMessage("CredentialsSignin")).toBe(
      "Email ou mot de passe incorrect.",
    );
    expect(getLoginErrorMessage({ error: "CredentialsSignin" })).toBe(
      "Email ou mot de passe incorrect.",
    );
  });

  it("returns string errors as-is", () => {
    expect(getLoginErrorMessage("Custom auth error")).toBe("Custom auth error");
  });

  it("falls back to a generic message", () => {
    expect(getLoginErrorMessage({})).toBe(
      "Une erreur s'est produite. Veuillez réessayer.",
    );
  });
});
