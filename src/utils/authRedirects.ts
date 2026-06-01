import {
  ADMIN,
  CLIENT,
  EMPLOYEE,
  OWNER,
  TRAVELER,
  USER,
} from "@/shared/constantes";

/**
 * Chemin absolu après authentification réussie (avec préfixe locale).
 */
export function getPostAuthRedirectPath(
  locale: string,
  role: string | undefined
): string {
  const prefix = `/${locale || "fr"}`;
  switch (role) {
    case CLIENT:
      return `${prefix}/mes-rendez-vous`;
    case EMPLOYEE:
      // Les employés n'ont accès qu'au planning
      return `${prefix}/admin/calendrier`;
    case ADMIN:
    case OWNER:
      return `${prefix}/admin/dashboard`;
    case USER:
      return `${prefix}/admin/trips`;
    case TRAVELER:
      return `${prefix}/admin/deliveries`;
    default:
      return `${prefix}/admin/dashboard`;
  }
}

export function usesAdminShellRole(role: string | undefined): boolean {
  if (!role) return false;
  return role === ADMIN || role === OWNER || role === EMPLOYEE;
}
