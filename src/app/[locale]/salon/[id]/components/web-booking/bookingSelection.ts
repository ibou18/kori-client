/**
 * Sélection de prestations d'une réservation web (1 à 4, même salon).
 *
 * Point unique des calculs de prix, durée, lieu et déplacement : les panneaux
 * ne refont pas ces calculs. Miroir de `BookingService.resolveBookingLines`
 * côté serveur, qui reste l'autorité (durée, prix et déplacement y sont
 * recalculés depuis la base) et de `utils/bookingSelection.ts` du mobile.
 *
 * Montants en dollars, durées en minutes.
 */
import {
  getCombinedAvailableLocations,
  getServiceLocations,
} from "./bookingLocation";
import { getOptionPriceDollars, getServiceDurationMinutes } from "./pricing";
import type {
  WebBookingSelectedService,
  WebBookingServiceOption,
  WebBookingServicePayload,
} from "./types";

export const MAX_SERVICES_PER_BOOKING = 4;

/** Même plafond que le serveur (12 h) ; l'horaire du salon borne le reste. */
export const MAX_BOOKING_DURATION_MINUTES = 720;

export function lineFromService(
  service: WebBookingServicePayload,
  option: WebBookingServiceOption,
  order: number
): WebBookingSelectedService {
  return { service, option, order };
}

/** Renumérote 1..N dans l'ordre du tableau. */
export function normalizeOrder(
  lines: WebBookingSelectedService[]
): WebBookingSelectedService[] {
  return lines.map((line, index) => ({ ...line, order: index + 1 }));
}

export function getServicesTotalDollars(
  lines: WebBookingSelectedService[]
): number {
  return (
    Math.round(
      lines.reduce((sum, l) => sum + getOptionPriceDollars(l.option), 0) * 100
    ) / 100
  );
}

export function getTotalDurationMinutes(
  lines: WebBookingSelectedService[]
): number {
  return lines.reduce(
    (sum, l) => sum + getServiceDurationMinutes(l.service.duration),
    0
  );
}

/**
 * Un seul déplacement par réservation : le plus élevé des prestations, à
 * l'avantage du salon (même règle que le serveur). 0 si pas à domicile.
 */
export function getBookingTravelFeeDollars(
  lines: WebBookingSelectedService[],
  isHomeService: boolean
): number {
  if (!isHomeService) return 0;
  return lines.reduce(
    (max, l) => Math.max(max, l.service.travelFees ?? 0),
    0
  );
}

/** Prestations + déplacement : base de la commission et du devis. */
export function getBookingSubtotalDollars(
  lines: WebBookingSelectedService[],
  isHomeService: boolean
): number {
  return (
    Math.round(
      (getServicesTotalDollars(lines) +
        getBookingTravelFeeDollars(lines, isHomeService)) *
        100
    ) / 100
  );
}

export type AddServiceRefusal =
  | "MAX_SERVICES"
  | "MAX_DURATION"
  | "DUPLICATE"
  | "INCOMPATIBLE_LOCATION"
  | "NO_OPTION";

const REFUSAL_MESSAGES: Record<AddServiceRefusal, string> = {
  MAX_SERVICES: `${MAX_SERVICES_PER_BOOKING} prestations maximum par réservation`,
  MAX_DURATION: "Durée maximale de 12 h atteinte",
  DUPLICATE: "Prestation déjà sélectionnée",
  INCOMPATIBLE_LOCATION: "Pas réalisable au même endroit que votre sélection",
  NO_OPTION: "Aucune formule réservable en ligne",
};

/**
 * Peut-on ajouter une prestation ? Sans `candidate`, répond pour le bouton
 * « Ajouter » ; avec, pour une prestation précise de la liste.
 */
export function canAddService(
  lines: WebBookingSelectedService[],
  candidate?: WebBookingServicePayload
): { ok: true } | { ok: false; reason: AddServiceRefusal; message: string } {
  const refuse = (reason: AddServiceRefusal) => ({
    ok: false as const,
    reason,
    message: REFUSAL_MESSAGES[reason],
  });

  if (lines.length >= MAX_SERVICES_PER_BOOKING) return refuse("MAX_SERVICES");
  const duration = getTotalDurationMinutes(lines);
  if (!candidate) {
    return duration >= MAX_BOOKING_DURATION_MINUTES
      ? refuse("MAX_DURATION")
      : { ok: true };
  }
  if (!candidate.options?.length) return refuse("NO_OPTION");
  if (lines.some((l) => l.service.id === candidate.id)) {
    return refuse("DUPLICATE");
  }
  if (
    getCombinedAvailableLocations([...lines.map((l) => l.service), candidate])
      .length === 0
  ) {
    return refuse("INCOMPATIBLE_LOCATION");
  }
  if (
    duration + getServiceDurationMinutes(candidate.duration) >
    MAX_BOOKING_DURATION_MINUTES
  ) {
    return refuse("MAX_DURATION");
  }
  return { ok: true };
}

/** Lieux encore possibles pour la sélection courante. */
export function getSelectionLocations(
  lines: WebBookingSelectedService[]
): ("SALON_ONLY" | "HOME_ONLY")[] {
  return getCombinedAvailableLocations(lines.map((l) => l.service));
}

/** Pour les candidats d'ajout : prestation seule, lieu par lieu. */
export { getServiceLocations };

/**
 * Empreinte ordonnée « service:option » : sert à savoir si la sélection a
 * changé depuis le choix d'un créneau.
 */
export function servicesSignature(
  lines: WebBookingSelectedService[]
): string {
  return [...lines]
    .sort((a, b) => a.order - b.order)
    .map((l) => `${l.service.id}:${l.option.id}`)
    .join("|");
}

/**
 * Lignes `services` de POST /bookings, dans l'ordre de sélection. Le
 * déplacement n'est envoyé qu'une fois, sur la première ligne (indicatif : le
 * serveur le recalcule).
 */
export function buildBookingServicesPayload(
  lines: WebBookingSelectedService[],
  isHomeService: boolean
) {
  const travelFee = getBookingTravelFeeDollars(lines, isHomeService);
  return normalizeOrder(lines).map((line, index) => ({
    serviceId: line.service.id,
    serviceOptionId: line.option.id,
    optionId: line.option.id,
    quantity: 1,
    discountPrice: getOptionPriceDollars(line.option),
    ...(index === 0 && travelFee > 0 ? { travelFee } : {}),
  }));
}

/** 90 → « 1h30 », 120 → « 2h », 45 → « 45 min ». */
export function formatDurationMinutes(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
}

export function formatServicesCount(count: number): string {
  return `${count} prestation${count > 1 ? "s" : ""}`;
}

/** « Tresses », « Tresses + Soin », ou « Tresses + 2 autres » au-delà de `max`. */
export function formatSelectionLabel(
  lines: WebBookingSelectedService[],
  max = 2
): string {
  const names = normalizeOrder(lines).map((l) => l.service.name);
  if (names.length <= max) return names.join(" + ");
  const shown = names.slice(0, Math.max(1, max - 1));
  const others = names.length - shown.length;
  return `${shown.join(" + ")} + ${others} autre${others > 1 ? "s" : ""}`;
}
