import type { WebBookingServiceOption } from "./types";

/** Prix en dollars affichés avec 2 décimales (fr-CA, ex. 45,60). */
export function formatSalonPriceDollars(value: number): string {
  return new Intl.NumberFormat("fr-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Durée en minutes (API mobile / Prisma : minutes ; valeurs très grandes = secondes). */
export function getServiceDurationMinutes(duration?: number): number {
  if (!duration || duration <= 0) return 30;
  if (duration > 2000) return Math.max(15, Math.round(duration / 60));
  return Math.max(15, Math.round(duration));
}

export function roundUpToCent(amount: number): number {
  return Number((Math.ceil(amount * 100) / 100).toFixed(2));
}

export function getOptionPriceDollars(option: WebBookingServiceOption): number {
  return option.discountPrice ?? option.price ?? 0;
}

export function computePlatformFeeDollars(
  servicePriceDollars: number,
  commissionRate: number
): number {
  return roundUpToCent(servicePriceDollars * commissionRate);
}
