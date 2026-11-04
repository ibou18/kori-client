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
  site?: SalonSiteDto | null;
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
