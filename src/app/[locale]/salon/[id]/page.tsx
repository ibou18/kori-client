"use client";

import { getSalonApi, getSalonReviewsApi, getSalonServicesApi } from "@/app/data/services";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SalonAbout, salonHasAbout } from "./sections/SalonAbout";
import { SalonFooter } from "./sections/SalonFooter";
import { SalonGallery } from "./sections/SalonGallery";
import { SalonHeader } from "./sections/SalonHeader";
import { SalonHours, salonHasHours } from "./sections/SalonHours";
import { SalonReviews } from "./sections/SalonReviews";
import { SalonServices } from "./sections/SalonServices";
import { SalonTabs, type SalonTab, type SalonTabKey } from "./sections/SalonTabs";
import { CartBar, SalonShop, SalonShopTeaser, useSalonProducts } from "./shop";
import {
  resolveSalonTheme,
  SALON_SITE_PREVIEW_MESSAGE,
  SALON_SITE_PREVIEW_READY,
  type SalonSiteDto,
  type SalonTheme,
} from "./theme/salonTheme";
import { SalonThemeProvider } from "./theme/SalonThemeProvider";
import type { PublicReview, PublicSalon, PublicService } from "./types";

const TAB_KEYS: SalonTabKey[] = ["prestations", "boutique", "avis", "a-propos", "galerie"];

/**
 * Mini-site public d'un salon (maquette KAN-16) : entête selon le gabarit choisi
 * (carrousel, bannière ou compact, avec ou sans logo), onglets Prestations ·
 * Boutique · Avis · À propos · Galerie, carte des horaires, pied de page.
 * Boutique (docs/PRODUCT_SALES.md côté serveur) : visible seulement si le salon
 * encaisse via Stripe Connect et a des produits en stock ; panier en sessionStorage. Le thème vient de
 * `salon.site` (null = gabarit carrousel, noir-blanc-gris). En mode `?preview=1`,
 * l'éditeur pousse un brouillon de thème par `postMessage` sans rien enregistrer.
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
  const [tab, setTab] = useState<SalonTabKey>("prestations");
  const { products } = useSalonProducts(salonId);

  // Mode aperçu : pas de deep link, écoute des brouillons de l'éditeur (même origine).
  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("preview") === "1";
    setIsPreview(preview);
    const hash = window.location.hash.replace("#", "") as SalonTabKey;
    if (TAB_KEYS.includes(hash)) setTab(hash);
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

  const bookService = useCallback(
    (service: PublicService) => {
      if (isPreview) return;
      router.push(`/${locale}/service/${salonId}/${service.id}/reservation`);
    },
    [isPreview, locale, router, salonId],
  );

  const changeTab = useCallback((next: SalonTabKey) => {
    setTab(next);
    if (typeof window !== "undefined") {
      window.history.replaceState(window.history.state, "", `#${next}`);
    }
  }, []);

  if (loading) {
    return (
      <div data-salon-page className="mx-auto flex min-h-screen max-w-3xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-neutral-900" />
          <p className="text-neutral-600">{isEn ? "Loading salon…" : "Chargement du salon..."}</p>
        </div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div data-salon-page className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-neutral-900">{isEn ? "Salon not found" : "Salon non trouvé"}</h1>
          <p className="mb-6 text-neutral-600">
            {error || (isEn ? "This salon does not exist" : "Ce salon n'existe pas")}
          </p>
          <button
            onClick={() => router.push("/")}
            className="h-12 rounded-full bg-neutral-900 px-6 font-semibold text-white"
          >
            {isEn ? "Back to home" : "Retour à l'accueil"}
          </button>
        </div>
      </div>
    );
  }

  const hasReviews = (salon.reviewCount ?? 0) > 0 || reviews.length > 0;
  const hasShop = products.length > 0;
  const proFirstName = salon.owner?.firstName?.trim() || null;
  const hasGallery = (salon.photos ?? []).filter((p) => p.url).length >= 1;
  const tabs: SalonTab[] = [
    { key: "prestations" as const, label: isEn ? "Services" : "Prestations" },
    hasShop && { key: "boutique" as const, label: isEn ? "Shop" : "Boutique" },
    hasReviews && { key: "avis" as const, label: isEn ? "Reviews" : "Avis" },
    salonHasAbout(salon) && { key: "a-propos" as const, label: isEn ? "About" : "À propos" },
    hasGallery && { key: "galerie" as const, label: isEn ? "Gallery" : "Galerie" },
  ].filter(Boolean) as SalonTab[];
  const activeTab = tabs.some((t) => t.key === tab) ? tab : "prestations";
  const showHours = salonHasHours(salon.openingHours);

  return (
    <SalonThemeProvider theme={theme} className="-mx-4 -mb-12 -mt-4 flex min-h-screen flex-col lg:-mx-8">
      <SalonHeader salon={salon} isEn={isEn} onShowReviews={hasReviews ? () => changeTab("avis") : undefined} />

      <div className="mx-auto w-full max-w-5xl flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8 lg:px-8 lg:pt-2">
        <div className="min-w-0">
          <SalonTabs tabs={tabs} active={activeTab} onChange={changeTab} />
          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
            {activeTab === "prestations" && (
              <>
                <SalonServices services={services} isEn={isEn} onBookService={bookService} disabled={isPreview} />
                <SalonShopTeaser
                  salonId={salonId}
                  locale={locale}
                  products={products}
                  proFirstName={proFirstName}
                  onShowShop={() => changeTab("boutique")}
                  disabled={isPreview}
                />
              </>
            )}
            {activeTab === "boutique" && (
              <SalonShop
                salonId={salonId}
                locale={locale}
                products={products}
                proFirstName={proFirstName}
                disabled={isPreview}
              />
            )}
            {activeTab === "avis" && (
              <SalonReviews reviews={reviews} rating={salon.rating} reviewCount={salon.reviewCount} isEn={isEn} />
            )}
            {activeTab === "a-propos" && <SalonAbout salon={salon} isEn={isEn} />}
            {activeTab === "galerie" && <SalonGallery salon={salon} isEn={isEn} />}
          </div>
        </div>

        {showHours && (
          <SalonHours
            openingHours={salon.openingHours}
            timezone={salon.timezone}
            isEn={isEn}
            className="mx-5 mb-7 mt-2 lg:sticky lg:top-20 lg:mx-0 lg:mt-14"
          />
        )}
      </div>

      {hasShop && !isPreview && (
        <CartBar
          salonId={salonId}
          onChooseService={() => {
            changeTab("prestations");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      <SalonFooter locale={locale} isEn={isEn} />
    </SalonThemeProvider>
  );
}
