/**
 * Tests unitaires — redirections post-auth selon le rôle
 * Couvre : chemins locale+rôle (CLIENT, EMPLOYEE, ADMIN/OWNER, …)
 * et détection shell admin.
 */
import { describe, expect, it } from "vitest";
import {
  ADMIN,
  CLIENT,
  EMPLOYEE,
  OWNER,
  TRAVELER,
  USER,
} from "@/shared/constantes";
import {
  getPostAuthRedirectPath,
  usesAdminShellRole,
} from "../utils/authRedirects";

// Mapping rôle → landing page (préfixe locale toujours présent)
describe("getPostAuthRedirectPath", () => {
  it("redirects based on role", () => {
    expect(getPostAuthRedirectPath("fr", CLIENT)).toBe("/fr/mes-rendez-vous");
    expect(getPostAuthRedirectPath("en", EMPLOYEE)).toBe(
      "/en/admin/calendrier",
    );
    expect(getPostAuthRedirectPath("fr", ADMIN)).toBe("/fr/admin/dashboard");
    expect(getPostAuthRedirectPath("fr", OWNER)).toBe("/fr/admin/dashboard");
    expect(getPostAuthRedirectPath("fr", USER)).toBe("/fr/admin/trips");
    expect(getPostAuthRedirectPath("fr", TRAVELER)).toBe(
      "/fr/admin/deliveries",
    );
  });

  it("defaults to fr and dashboard", () => {
    expect(getPostAuthRedirectPath("", undefined)).toBe("/fr/admin/dashboard");
    expect(getPostAuthRedirectPath("fr", "UNKNOWN")).toBe(
      "/fr/admin/dashboard",
    );
  });
});

// ADMIN / OWNER / EMPLOYEE → shell admin ; CLIENT non
describe("usesAdminShellRole", () => {
  it("detects admin shell roles", () => {
    expect(usesAdminShellRole(ADMIN)).toBe(true);
    expect(usesAdminShellRole(OWNER)).toBe(true);
    expect(usesAdminShellRole(EMPLOYEE)).toBe(true);
    expect(usesAdminShellRole(CLIENT)).toBe(false);
    expect(usesAdminShellRole(undefined)).toBe(false);
  });
});
