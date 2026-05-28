import type { WebBookingStaffMember } from "./types";

/** Extrait `data` d’une réponse API salon ou retourne l’objet brut. */
export function parseSalonDetailPayload(
  raw: unknown,
): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in raw && raw.data && typeof raw.data === "object") {
    return raw.data as Record<string, unknown>;
  }
  return raw as Record<string, unknown>;
}

/** Owner + employés (dédupliqués), aligné sur le mobile. */
export function buildWebBookingStaffOptions(
  salon: Record<string, unknown> | null,
): WebBookingStaffMember[] {
  if (!salon) return [];
  const list: WebBookingStaffMember[] = [];

  const owner = salon.owner as WebBookingStaffMember | undefined;
  if (owner?.id) {
    list.push({
      id: owner.id,
      firstName: owner.firstName ?? "",
      lastName: owner.lastName ?? "",
    });
  }

  const employees = salon.employees;
  if (Array.isArray(employees)) {
    for (const e of employees) {
      if (!e || typeof e !== "object") continue;
      const row = e as WebBookingStaffMember;
      if (!row.id || list.some((x) => x.id === row.id)) continue;
      list.push({
        id: row.id,
        firstName: row.firstName ?? "",
        lastName: row.lastName ?? "",
      });
    }
  }

  return list;
}

/** Afficher le choix pro seulement si le salon a au moins un employé (hors owner seul). */
export function salonHasTeamEmployees(
  salon: Record<string, unknown> | null,
): boolean {
  const employees = salon?.employees;
  return Array.isArray(employees) && employees.length > 0;
}
