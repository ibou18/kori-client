/** Aligné sur les valeurs `availableLocations` des services (admin). */
export type BookingLocationMode = "salon_only" | "home_only" | "choice";

export function getBookingLocationMode(
  salonOffersHomeService: boolean,
  availableLocations?: string[] | null
): BookingLocationMode {
  if (!salonOffersHomeService) return "salon_only";
  const locs =
    availableLocations && availableLocations.length > 0
      ? availableLocations
      : ["SALON_ONLY"];
  const canSalon = locs.includes("SALON_ONLY") || locs.includes("BOTH");
  const canHome = locs.includes("HOME_ONLY") || locs.includes("BOTH");
  if (canHome && !canSalon) return "home_only";
  if (canHome && canSalon) return "choice";
  return "salon_only";
}

/**
 * Lieux proposés par une prestation : liste vide = « au salon », `BOTH` vaut
 * les deux, et pas de domicile sans frais de déplacement définis (règle
 * partagée avec l'app mobile et le serveur).
 */
export function getServiceLocations(service: {
  availableLocations?: string[] | null;
  travelFees?: number | null;
}): ("SALON_ONLY" | "HOME_ONLY")[] {
  const locs =
    service.availableLocations && service.availableLocations.length > 0
      ? service.availableLocations
      : ["SALON_ONLY"];
  const result: ("SALON_ONLY" | "HOME_ONLY")[] = [];
  if (locs.includes("SALON_ONLY") || locs.includes("BOTH")) {
    result.push("SALON_ONLY");
  }
  if (
    (locs.includes("HOME_ONLY") || locs.includes("BOTH")) &&
    service.travelFees != null
  ) {
    result.push("HOME_ONLY");
  }
  return result;
}

/** Lieux communs à toutes les prestations choisies (intersection). */
export function getCombinedAvailableLocations(
  services: {
    availableLocations?: string[] | null;
    travelFees?: number | null;
  }[]
): ("SALON_ONLY" | "HOME_ONLY")[] {
  if (services.length === 0) return [];
  return services
    .map(getServiceLocations)
    .reduce((common, locs) => common.filter((loc) => locs.includes(loc)));
}
