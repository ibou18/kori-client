import { JsonLd } from "@/components/JsonLd";
import {
  absoluteUrl,
  buildOpenGraph,
  buildTwitter,
  siteConfig,
} from "@/config/site";
import type { Metadata } from "next";

/**
 * Métadonnées SEO et JSON-LD des pages salon publiques.
 * La page elle-même est un composant client : le salon est donc récupéré ici,
 * côté serveur, avec cache d'une heure. En cas d'échec, métadonnées génériques.
 */

const API_BASE_URL =
  process.env.NEXT_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:2020/api";

type DayHours = { open: string; close: string } | null | undefined;

interface PublicSalon {
  id: string;
  name: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    province?: string;
  };
  photos?: Array<{ url: string; isMain?: boolean }>;
  salonTypes?: string[];
  openingHours?: Record<string, DayHours>;
  rating?: number;
  reviewCount?: number;
}

const SALON_TYPE_LABELS: Record<string, string> = {
  HAIRDRESSER: "Coiffure",
  BARBER: "Barbier",
  MANICURIST: "Manucure",
  NAIL_SALON: "Manucure",
  SPA: "Spa",
  BEAUTY: "Institut de beauté",
};

const SCHEMA_DAYS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

async function fetchPublicSalon(id: string): Promise<PublicSalon | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/salons/${encodeURIComponent(id)}/detail`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success && json?.data?.name ? (json.data as PublicSalon) : null;
  } catch {
    return null;
  }
}

const truncate = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

function describeSalon(salon: PublicSalon) {
  const types = Array.from(
    new Set(
      (salon.salonTypes ?? []).map((t) => SALON_TYPE_LABELS[t]).filter(Boolean)
    )
  );
  const city = salon.address?.city;
  const activity = types.length ? types.join(", ").toLowerCase() : "beauté";
  const base = salon.description?.trim()
    ? salon.description.trim()
    : `Découvrez les prestations de ${salon.name}${city ? ` à ${city}` : ""}.`;
  return {
    title: `${salon.name}${city ? ` · ${activity} à ${city}` : ` · ${activity}`}`,
    description: truncate(
      `${base} Réservez en ligne avec korí : confirmation immédiate et rappel avant le rendez-vous.`,
      160
    ),
    types,
  };
}

function getMainPhoto(salon: PublicSalon) {
  const photos = (salon.photos ?? []).filter((p) => p.url);
  return (photos.find((p) => p.isMain) ?? photos[0])?.url;
}

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const salon = await fetchPublicSalon(id);
  const canonical = `/fr/salon/${id}`;

  if (!salon) {
    return {
      title: "Salon de beauté",
      alternates: { canonical },
    };
  }

  const { title, description } = describeSalon(salon);
  const image = getMainPhoto(salon);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: buildOpenGraph({
      title,
      description,
      url: absoluteUrl(canonical),
      ...(image ? { images: [{ url: image, alt: salon.name }] } : {}),
    }),
    twitter: buildTwitter({ title, description, ...(image ? { image } : {}) }),
  };
}

export default async function SalonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;
  const salon = await fetchPublicSalon(id);

  if (!salon) return children;

  const { description } = describeSalon(salon);
  const isHairSalon = salon.salonTypes?.some((t) =>
    ["HAIRDRESSER", "BARBER"].includes(t)
  );
  const openingHours = Object.entries(salon.openingHours ?? {})
    .filter(([day, hours]) => SCHEMA_DAYS[day] && hours?.open && hours?.close)
    .map(([day, hours]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAYS[day],
      opens: hours!.open,
      closes: hours!.close,
    }));
  const images = (salon.photos ?? []).map((p) => p.url).filter(Boolean);

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isHairSalon ? "HairSalon" : "BeautySalon",
    "@id": absoluteUrl(`/fr/salon/${id}#salon`),
    name: salon.name,
    description,
    url: absoluteUrl(`/fr/salon/${id}`),
    ...(images.length ? { image: images.slice(0, 5) } : {}),
    ...(salon.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: salon.address.street,
            addressLocality: salon.address.city,
            addressRegion: salon.address.province,
            postalCode: salon.address.postalCode,
            addressCountry: salon.address.country || "CA",
          },
        }
      : {}),
    ...(openingHours.length ? { openingHoursSpecification: openingHours } : {}),
    ...(salon.rating && salon.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(salon.rating.toFixed(1)),
            reviewCount: salon.reviewCount,
          },
        }
      : {}),
    potentialAction: {
      "@type": "ReserveAction",
      target: absoluteUrl(`/fr/salon/${id}`),
    },
    isPartOf: { "@id": `${siteConfig.url}/#website` },
  };

  return (
    <>
      <JsonLd data={structuredData} />
      {children}
    </>
  );
}
