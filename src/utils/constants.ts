/**
 * Constantes pour les types de salon
 */
export const SALON_TYPES = [
  { value: "HAIRDRESSER", label: "Coiffeur" },
  { value: "BARBER", label: "Barbier" },
  { value: "NAIL_SALON", label: "Manucure" },
  { value: "SPA", label: "Spa" },
  { value: "BEAUTY", label: "Beauté" },
] as const;

/**
 * Constantes pour les fuseaux horaires (Canada, États-Unis, Europe de l'Ouest)
 */
export const TIMEZONES = [
  // Canada
  { value: "America/Toronto", label: "America/Toronto (EST)" },
  { value: "America/Montreal", label: "America/Montreal (EST)" },
  { value: "America/Vancouver", label: "America/Vancouver (PST)" },
  { value: "America/Edmonton", label: "America/Edmonton (MST)" },
  { value: "America/Winnipeg", label: "America/Winnipeg (CST)" },
  { value: "America/Halifax", label: "America/Halifax (AST)" },
  // États-Unis
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver", label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "America/Phoenix", label: "America/Phoenix (MST)" },
  { value: "America/Anchorage", label: "America/Anchorage (AKST/AKDT)" },
  { value: "America/Honolulu", label: "America/Honolulu (HST)" },
  // Europe de l'Ouest
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Brussels", label: "Europe/Brussels (CET/CEST)" },
  { value: "Europe/Amsterdam", label: "Europe/Amsterdam (CET/CEST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Europe/Madrid", label: "Europe/Madrid (CET/CEST)" },
  { value: "Europe/Rome", label: "Europe/Rome (CET/CEST)" },
  { value: "Europe/Lisbon", label: "Europe/Lisbon (WET/WEST)" },
  { value: "Europe/Dublin", label: "Europe/Dublin (GMT/IST)" },
] as const;

/**
 * Constantes pour les jours de la semaine
 */
export const DAYS = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
] as const;
