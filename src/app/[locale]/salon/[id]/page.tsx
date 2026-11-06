"use client";

import {
  getSalonApi,
  getSalonReviewsApi,
  getSalonServicesApi,
} from "@/app/data/services";
import { CalendarCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SalonAbout } from "./sections/SalonAbout";
import { SalonContact, salonHasContact } from "./sections/SalonContact";
import { SalonFooter } from "./sections/SalonFooter";
import { SalonHero } from "./sections/SalonHero";
import { SalonHours } from "./sections/SalonHours";
import { SalonReviews } from "./sections/SalonReviews";
import { SalonSectionNav, type SalonNavItem } from "./sections/SalonSectionNav";
import { SalonServices } from "./sections/SalonServices";
import {
  resolveSalonTheme,
  SALON_SITE_PREVIEW_MESSAGE,
  SALON_SITE_PREVIEW_READY,
  type SalonSiteDto,
  type SalonTheme,
} from "./theme/salonTheme";
import { SalonThemeProvider } from "./theme/SalonThemeProvider";
import type { PublicReview, PublicSalon, PublicService } from "./types";

/**
 * Mini-site public d'un salon : bandeau photos aux couleurs du salon, services,
 * à propos, horaires, avis, contact. Le thème vient de `salon.site` (null =
 * thème korí). En mode `?preview=1`, l'éditeur pousse un brouillon de thème
 * par `postMessage` sans rien enregistrer.
 */
export default function SalonSharePage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;
  const locale = (params.locale as string) || "fr";
  const isEn = locale.startsWith("en");

  const [salon, setSalon] = useState<PublicSalon | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewSite, setPreviewSite] = useState<SalonSiteDto | null | undefined>(undefined);
  const [isPreview, setIsPreview] = useState(false);

  // Mode aperçu : pas de deep link, écoute des brouillons de l'éditeur (même origine).
  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("preview") === "1";
    setIsPreview(preview);
    if (!preview) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; site?: SalonSiteDto | null } | undefined;
      if (data?.type === SALON_SITE_PREVIEW_MESSAGE) setPreviewSite(data.site ?? null);
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: SALON_SITE_PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Tenter d'ouvrir l'app mobile au chargement (hors aperçu). Si elle ne
  // s'ouvre pas, la page web reste affichée : pas de redirection vers le store.
  useEffect(() => {
    if (!salonId) return;
    if (new URLSearchParams(window.location.search).get("preview") === "1") return;
    const isMobile = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
    if (!isMobile) return;
    window.location.href = `kori://salon/salon-detail?id=${salonId}`;
  }, [salonId]);

  useEffect(() => {
    if (!salonId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [salonRes, servicesRes, reviewsRes] = await Promise.all([
          getSalonApi(salonId),
          getSalonServicesApi(salonId),
          getSalonReviewsApi(salonId),
        ]);
        if (cancelled) return;
        if (salonRes?.success && salonRes?.data) {
          setSalon(salonRes.data as PublicSalon);
        } else {
          setError(isEn ? "Salon not found" : "Salon non trouvé");
        }
        if (servicesRes?.success && Array.isArray(servicesRes.data)) {
          setServices(servicesRes.data);
        } else if (salonRes?.success && Array.isArray(salonRes.data?.services)) {
          setServices(salonRes.data.services);
        }
        if (reviewsRes?.success && Array.isArray(reviewsRes.data)) {
          setReviews(reviewsRes.data);
        }
      } catch (err) {
        console.error("Erreur récupération salon:", err);
        if (!cancelled) setError(isEn ? "Could not load the salon" : "Erreur lors du chargement du salon");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [salonId, isEn]);

  const theme: SalonTheme = useMemo(
    () => resolveSalonTheme(previewSite !== undefined ? previewSite : salon?.site),
    [previewSite, salon?.site],
  );

  const scrollToServices = useCallback(() => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const bookService = useCallback(
    (service: PublicService) => {
      if (isPreview) return;
      router.push(`/${locale}/service/${salonId}/${service.id}/reservation`);
    },
    [isPreview, locale, router, salonId],
  );

  if (loading) {
    return (
      <div data-salon-page className="mx-auto flex min-h-screen max-w-3xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-[#53745D]" />
          <p className="text-slate-600">{isEn ? "Loading salon…" : "Chargement du salon..."}</p>
        </div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div data-salon-page className="mx-auto flex min-h-screen max-w-3xl items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-slate-800">
            {isEn ? "Salon not found" : "Salon non trouvé"}
          </h1>
          <p className="mb-6 text-slate-600">
            {error || (isEn ? "This salon does not exist" : "Ce salon n'existe pas")}
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-gradient-to-r from-[#53745D] to-[#3a5a47] px-6 py-3 font-semibold text-white shadow-md transition-all hover:brightness-110"
          >
            {isEn ? "Back to home" : "Retour à l'accueil"}
          </button>
        </div>
      </div>
    );
  }

  const hasDescription = !!salon.description?.trim();
  const photoCount = (salon.photos ?? []).filter((p) => p.url).length;
  const hasHours = !!salon.openingHours && Object.values(salon.openingHours).some((h) => h?.open && h?.close);
  const hasReviews = reviews.some((r) => r.comment?.trim());
  const hasContact = salonHasContact(salon);

  const navItems: SalonNavItem[] = [
    services.length > 0 && { id: "services", label: isEn ? "Services" : "Services" },
    hasDescription && { id: "a-propos", label: isEn ? "About" : "À propos" },
    photoCount >= 2 && { id: "galerie", label: isEn ? "Gallery" : "Galerie" },
    hasHours && { id: "horaires", label: isEn ? "Hours" : "Horaires" },
    hasReviews && { id: "avis", label: isEn ? "Reviews" : "Avis" },
    hasContact && { id: "contact", label: "Contact" },
  ].filter(Boolean) as SalonNavItem[];

  return (
    <SalonThemeProvider theme={theme} className="-mt-4 min-h-screen">
      <SalonHero salon={salon} isEn={isEn} onBook={scrollToServices} />
      <SalonSectionNav items={navItems} />

      <div className="mx-auto max-w-5xl sm:px-4">
        <SalonServices services={services} isEn={isEn} onBookService={bookService} />
        <SalonAbout salon={salon} isEn={isEn} />
        <SalonHours openingHours={salon.openingHours} timezone={salon.timezone} isEn={isEn} />
        <SalonReviews
          reviews={reviews}
          rating={salon.rating}
          reviewCount={salon.reviewCount}
          isEn={isEn}
        />
        <SalonContact salon={salon} isEn={isEn} />
      </div>

      <SalonFooter salonId={salonId} isEn={isEn} />

      {/* Barre d'action mobile : Réserver toujours à portée de pouce */}
      {services.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-white/[0.92] p-3 backdrop-blur sm:hidden">
          <button
            type="button"
            onClick={scrollToServices}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold shadow-lg"
            style={{ background: theme.secondaryColor, color: theme.onSecondary }}
          >
            <CalendarCheck className="size-5" />
            {isEn ? "Book an appointment" : "Réserver un rendez-vous"}
          </button>
        </div>
      )}
      <div className="h-20 sm:hidden" aria-hidden />
    </SalonThemeProvider>
  );
}
