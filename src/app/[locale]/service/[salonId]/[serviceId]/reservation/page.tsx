"use client";

import { SalonWebBookingFlow } from "@/app/[locale]/salon/[id]/components/web-booking";
import { getSalonApi, getSalonServiceByIdApi } from "@/app/data/services";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ServiceData {
  id: string;
  name: string;
  duration?: number;
  photos?: Array<{ url: string; alt?: string }>;
  options?: Array<{
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
  }>;
  availableLocations?: string[];
  homeTravelFeeDollars?: number;
  salon?: { id: string; name: string };
}

export default function ServiceReservationPage() {
  const params = useParams();
  const salonId = params.salonId as string;
  const serviceId = params.serviceId as string;
  const locale = (params.locale as string) || "fr";

  const [service, setService] = useState<ServiceData | null>(null);
  const [salonName, setSalonName] = useState("");
  const [salonOffersHomeService, setSalonOffersHomeService] = useState(false);
  const [salonProvince, setSalonProvince] = useState("QC");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backHref = `/${locale}/salon/${salonId}`;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [svcRes, salonRes] = await Promise.all([
          getSalonServiceByIdApi(salonId, serviceId),
          getSalonApi(salonId),
        ]);

        if (cancelled) return;

        if (svcRes?.success && svcRes?.data) {
          setService(svcRes.data as ServiceData);
        } else {
          setError("Service introuvable ou indisponible.");
          setService(null);
        }

        const salonRaw = salonRes as
          | { data?: Record<string, unknown> }
          | Record<string, unknown>
          | null;
        const salon =
          salonRaw && typeof salonRaw === "object" && "data" in salonRaw
            ? (salonRaw as { data?: Record<string, unknown> }).data
            : (salonRaw as Record<string, unknown> | null);

        if (salon && typeof salon === "object") {
          setSalonName(typeof salon.name === "string" ? salon.name : "");
          setSalonOffersHomeService(salon.offersHomeService === true);
          const addr = salon.address as { province?: string } | undefined;
          if (addr?.province && typeof addr.province === "string") {
            setSalonProvince(addr.province);
          }
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

    if (salonId && serviceId) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [salonId, serviceId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="h-10 w-10 animate-spin text-[#53745D]" />
        <p>Préparation de votre réservation…</p>
      </div>
    );
  }

  if (error || !service?.options?.length) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-slate-700 mb-4">
          {error || "Réservation indisponible."}
        </p>
        <Link
          href={backHref}
          className="text-[#53745D] font-semibold underline underline-offset-2"
        >
          Retour au salon
        </Link>
      </div>
    );
  }

  const servicePayload = {
    id: service.id,
    name: service.name,
    duration: service.duration,
    photos: service.photos,
    options: service.options,
    availableLocations: service.availableLocations,
    homeTravelFeeDollars: service.homeTravelFeeDollars,
  };

  const displaySalonName = salonName || service.salon?.name || "Salon";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4F1]/50 to-slate-50">
      <div className="max-w-2xl mx-auto px-0 py-8 md:py-12">
        <div className="bg-white rounded-2xl border border-[#53745D]/15 shadow-md p-4 md:p-10">
          <SalonWebBookingFlow
            variant="page"
            salonId={salonId}
            salonName={displaySalonName}
            locale={locale}
            salonProvince={salonProvince}
            salonOffersHomeService={salonOffersHomeService}
            service={servicePayload}
            backHref={backHref}
          />
        </div>
      </div>
    </div>
  );
}
