import type { SalonSiteDto } from "./theme/salonTheme";

/** Types de la page publique d'un salon (`GET /salons/:id/detail`, `GET /salons/:id/services`). */

export interface PublicServiceCategory {
  id: string;
  name: string;
}

export interface PublicService {
  id: string;
  name: string;
  description?: string;
  particularities?: string;
  duration?: number;
  categoryId?: string;
  category?: PublicServiceCategory;
  photos?: Array<{ url: string; alt?: string }>;
  options?: Array<{
    id: string;
    name?: string;
    price: number;
    discountPrice?: number;
  }>;
}

export type DayHours = { open: string; close: string } | null | undefined;

export type OpeningHours = Partial<
  Record<
    "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
    DayHours
  >
>;

export interface PublicSalon {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string | null;
  timezone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    province?: string;
    latitude?: number;
    longitude?: number;
  };
  photos?: Array<{
    id: string;
    url: string;
    alt?: string;
    isMain?: boolean;
    order?: number;
  }>;
  salonTypes?: string[];
  services?: PublicService[];
  openingHours?: OpeningHours;
  rating?: number;
  reviewCount?: number;
  offersHomeService?: boolean;
  /** false = la prestataire masque son adresse : ville et code postal seulement. */
  showFullAddress?: boolean;
  /** Posé par le serveur quand l'adresse renvoyée est partielle (pas encore de réservation). */
  addressHidden?: boolean;
  site?: SalonSiteDto | null;
  /** Seul le prénom est lu (« Les produits d'Aïcha »). */
  owner?: { firstName?: string | null } | null;
}

export interface PublicReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  client?: { firstName?: string | null; lastName?: string | null } | null;
}

export const SALON_TYPE_LABELS: Record<string, string> = {
  HAIRDRESSER: "Coiffure",
  BARBER: "Barbier",
  MANICURIST: "Manucure",
  NAIL_SALON: "Salon de manucure",
  SPA: "Spa",
  BEAUTY: "Institut de beauté",
  MAQUILLAGE: "Maquillage",
  CILS: "Cils & sourcils",
  BODY_CARE: "Soins du corps",
};

export const getSalonTypeLabel = (type: string): string =>
  SALON_TYPE_LABELS[type] || type;

type AddressLike = {
  street?: string | null;
  apartment?: string | null;
  city?: string | null;
  postalCode?: string | null;
} | null | undefined;

/**
 * Adresse masquée par la prestataire (docs/SALON_ADDRESS_PRIVACY.md côté serveur) :
 * le serveur ne renvoie alors que la ville et le code postal, rue vide.
 */
export function isSalonAddressHidden(salon: {
  addressHidden?: boolean;
  showFullAddress?: boolean;
  address?: AddressLike;
} | null | undefined): boolean {
  if (!salon) return false;
  return salon.addressHidden === true || (salon.showFullAddress === false && !salon.address?.street?.trim());
}

/**
 * Ligne d'adresse à afficher : « rue, ville » si l'adresse est publique,
 * « ville, code postal » si elle est masquée.
 */
export function formatSalonAddress(address: AddressLike): string {
  if (!address) return "";
  const street = address.street?.trim();
  if (street) return [street, address.city?.trim()].filter(Boolean).join(", ");
  return [address.city?.trim(), address.postalCode?.trim()].filter(Boolean).join(", ");
}
