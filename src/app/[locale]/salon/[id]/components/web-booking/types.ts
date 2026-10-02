export type WebBookingStep =
  | "auth"
  | "service"
  | "location"
  | "slot"
  | "notes"
  | "pay";

export type WebBookingAssignmentMode =
  | "FIRST_AVAILABLE"
  | "SPECIFIC_EMPLOYEE";

export interface WebBookingStaffMember {
  id: string;
  firstName: string;
  lastName: string;
}

export interface WebBookingServiceOption {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
}

export interface WebBookingServicePayload {
  id: string;
  name: string;
  description?: string;
  particularities?: string;
  duration?: number;
  photos?: Array<{ url: string; alt?: string }>;
  options?: WebBookingServiceOption[];
  /** Ex. SALON_ONLY, HOME_ONLY, BOTH (catalogue admin). */
  availableLocations?: string[];
  /**
   * Frais de déplacement de la prestation (CAD), champ `travelFees` de l'API.
   * `null`/absent = la prestation ne se fait pas à domicile (même règle que
   * l'app mobile et que le serveur).
   */
  travelFees?: number | null;
  /** Les prestations actives seulement sont réservables. */
  isActive?: boolean;
}

/**
 * Une prestation choisie dans la réservation (1 à 4, même salon), figée au
 * moment du choix. `order` = ordre de sélection, qui fixe l'enchaînement.
 */
export interface WebBookingSelectedService {
  service: WebBookingServicePayload;
  option: WebBookingServiceOption;
  order: number;
}

export interface SalonBookingTimeSlot {
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
  duration: number;
  available: boolean;
  suggestedEmployee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
}

export interface SalonBookingDay {
  date: string;
  isOpen: boolean;
  timeSlots: SalonBookingTimeSlot[];
  hasHoliday?: boolean;
  holidayReason?: string;
}

export interface SalonBookingAvailabilityPayload {
  salonId: string;
  date: string;
  timezone: string;
  day: SalonBookingDay;
}
