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
