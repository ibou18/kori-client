"use client";

import { SalonWebBookingFlow } from "@/app/[locale]/salon/[id]/components/web-booking";
import { resolveSalonTheme, type SalonSiteDto } from "@/app/[locale]/salon/[id]/theme/salonTheme";
import { SalonThemeProvider } from "@/app/[locale]/salon/[id]/theme/SalonThemeProvider";
import { getSalonApi, getSalonServiceByIdApi } from "@/app/data/services";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface ServiceData {
  id: string;
  name: string;
  description?: string;
  particularities?: string;
  duration?: number;
  photos?: Array<{ url: string; alt?: string }>;
  options?: Array<{
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
  }>;
  availableLocations?: string[];
  /** Frais de déplacement (CAD) ; `null` = pas de domicile. */
  travelFees?: number | null;
  salon?: { id: string; name: string };
}

interface SalonMeta {
  name: string;
  offersHomeService: boolean;
  province: string;
  site: SalonSiteDto | null;
}

/**
 * Page de réservation d'une prestation : le parcours est rendu aux couleurs et
 * polices du mini-site du salon (`salon.site`), plein écran sur téléphone,
 * colonne centrée en carte sur ordinateur.
 */
export default function ServiceReservationPage() {
  const params = useParams();
  const salonId = params.salonId as string;
  const serviceId = params.serviceId as string;
  const locale = (params.locale as string) || "fr";

  const [service, setService] = useState<ServiceData | null>(null);
  const [salonMeta, setSalonMeta] = useState<SalonMeta>({ name: "", offersHomeService: false, province: "QC", site: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backHref = `/${locale}/salon/${salonId}`;
  const theme = useMemo(() => resolveSalonTheme(salonMeta.site), [salonMeta.site]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [svcRes, salonRes] = await Promise.all([getSalonServiceByIdApi(salonId, serviceId), getSalonApi(salonId)]);
        if (cancelled) return;

        if (svcRes?.success && svcRes?.data) {
          setService(svcRes.data as ServiceData);
        } else {
          setError("Service introuvable ou indisponible.");
          setService(null);
        }

        const salonRaw = salonRes as { data?: Record<string, unknown> } | Record<string, unknown> | null;
        const salon =
          salonRaw && typeof salonRaw === "object" && "data" in salonRaw
            ? (salonRaw as { data?: Record<string, unknown> }).data
            : (salonRaw as Record<string, unknown> | null);

        if (salon && typeof salon === "object") {
          const addr = salon.address as { province?: string } | undefined;
          setSalonMeta({
            name: typeof salon.name === "string" ? salon.name : "",
            offersHomeService: salon.offersHomeService === true,
            province: addr?.province && typeof addr.province === "string" ? addr.province : "QC",
            site: (salon.site as SalonSiteDto | null | undefined) ?? null,
          });
        }
      } catch {
        if (!cancelled) {
          setError("Impossible de charger la réservation.");
          setService(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (salonId && serviceId) load();
    return () => {
      cancelled = true;
    };
  }, [salonId, serviceId]);

  if (loading) {
    return (
      <div data-salon-page className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-neutral-600">
        <Loader2 className="size-10 animate-spin text-neutral-900" />
        <p>Préparation de votre réservation…</p>
      </div>
    );
  }

  if (error || !service?.options?.length) {
    return (
      <div data-salon-page className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 text-neutral-700">{error || "Réservation indisponible."}</p>
        <Link href={backHref} className="font-semibold text-neutral-900 underline underline-offset-2">
          Retour au salon
        </Link>
      </div>
    );
  }

  const servicePayload = {
    id: service.id,
    name: service.name,
    description: service.description,
    particularities: service.particularities,
    duration: service.duration,
    photos: service.photos,
    options: service.options,
    availableLocations: service.availableLocations,
    travelFees: service.travelFees ?? null,
  };

  const displaySalonName = salonMeta.name || service.salon?.name || "Salon";

  return (
    <SalonThemeProvider theme={theme} className="-mx-4 -mb-12 -mt-4 min-h-screen lg:-mx-8">
      <div className="mx-auto w-full max-w-[640px] md:py-8">
        <div className="bg-site-bg md:overflow-hidden md:rounded-3xl md:border md:border-site-border md:shadow-[0_18px_50px_-30px_rgba(17,17,17,0.35)]">
          <SalonWebBookingFlow
            salonId={salonId}
            salonName={displaySalonName}
            locale={locale}
            salonProvince={salonMeta.province}
            salonOffersHomeService={salonMeta.offersHomeService}
            service={servicePayload}
            backHref={backHref}
          />
        </div>
      </div>
    </SalonThemeProvider>
  );
}
