"use client";

import {
  computePlatformFeeDollars,
  formatSalonPriceDollars,
} from "./web-booking/pricing";
import { calculateTaxesApi, getSalonServiceByIdApi } from "@/app/data/services";
import { useGetPlatformConfig } from "@/app/data/hooks";
import { Download, Globe, Loader2, Smartphone, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface ServiceData {
  id: string;
  name: string;
  description?: string;
  particularities?: string;
  photos?: Array<{ url: string; alt?: string }>;
  options?: Array<{
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
  }>;
  duration?: number;
  availableLocations?: string[];
  homeTravelFeeDollars?: number;
  salon?: { id: string; name: string };
  salonId?: string;
}

interface ServiceDetailModalProps {
  salonId: string;
  serviceId: string;
  salonName?: string;
  salonProvince?: string;
  locale?: string;
  onClose: () => void;
}

export function ServiceDetailModal({
  salonId,
  serviceId,
  salonName,
  salonProvince,
  locale = "fr",
  onClose,
}: ServiceDetailModalProps) {
  const router = useRouter();
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taxOnFee, setTaxOnFee] = useState<number | null>(null);
  const [taxLoading, setTaxLoading] = useState(false);
  const { data: platformConfigData } = useGetPlatformConfig();
  const bookingFeeRate =
    platformConfigData?.data?.defaultCommissionRate ??
    platformConfigData?.defaultCommissionRate ??
    0.06;

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const result = await getSalonServiceByIdApi(salonId, serviceId);
        if (result?.success && result?.data) {
          setService(result.data);
        } else {
          setError("Service non trouvé");
        }
      } catch {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (salonId && serviceId) {
      fetchService();
    }
  }, [salonId, serviceId]);

  const getDeepLink = () =>
    `kori://booking/service-selected?id=${salonId}&serviceId=${serviceId}`;

  const getUserPlatform = () => {
    if (typeof window === "undefined") return "desktop";
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return "ios";
    if (/android/i.test(ua)) return "android";
    return "desktop";
  };

  const handleOpenApp = () => {
    const platform = getUserPlatform();
    const deepLink = getDeepLink();
    if (platform === "ios") {
      window.location.href = deepLink;
    } else if (platform === "android") {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = deepLink;
      document.body.appendChild(iframe);
      setTimeout(() => document.body.removeChild(iframe), 1000);
    } else {
      const link = document.createElement("a");
      link.href = deepLink;
      link.click();
    }
    const fallback = setTimeout(() => {
      if (platform === "ios")
        window.location.href = process.env.IOS_STORE_URL || "";
      else if (platform === "android")
        window.location.href = process.env.ANDROID_STORE_URL || "";
      else window.location.href = `/${locale}/download-app`;
    }, 2000);
    window.addEventListener("blur", () => clearTimeout(fallback), {
      once: true,
    });
  };

  const handleDownload = () => {
    const platform = getUserPlatform();
    if (platform === "ios")
      window.location.href = process.env.IOS_STORE_URL || "";
    else if (platform === "android")
      window.location.href = process.env.ANDROID_STORE_URL || "";
    else window.location.href = `/${locale}/download-app`;
  };

  const getMinPrice = () => {
    if (!service?.options || service.options.length === 0) return null;
    if (service.options.length === 1)
      return service.options[0].discountPrice || service.options[0].price;
    return Math.min(...service.options.map((o) => o.discountPrice || o.price));
  };

  const minPrice = getMinPrice();
  const province = (salonProvince || "QC").toUpperCase();
  const feePercentLabel = Math.round(bookingFeeRate * 100);

  const platformFee = useMemo(() => {
    if (minPrice === null) return null;
    return computePlatformFeeDollars(minPrice, bookingFeeRate);
  }, [minPrice, bookingFeeRate]);

  useEffect(() => {
    if (platformFee === null) {
      setTaxOnFee(null);
      return;
    }
    let cancelled = false;
    setTaxOnFee(null);
    setTaxLoading(true);
    (async () => {
      try {
        const res = await calculateTaxesApi({
          amount: platformFee,
          province,
        });
        const t = res?.data?.taxes?.totalTax;
        if (!cancelled) {
          setTaxOnFee(typeof t === "number" ? t : 0);
        }
      } catch {
        if (!cancelled) setTaxOnFee(0);
      } finally {
        if (!cancelled) setTaxLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [platformFee, province]);

  const totalAcompteEnLigne =
    platformFee !== null && taxOnFee !== null ? platformFee + taxOnFee : null;
  const totalGlobal =
    minPrice !== null && platformFee !== null && taxOnFee !== null
      ? minPrice + platformFee + taxOnFee
      : null;

  const handleReserveOnline = () => {
    onClose();
    router.push(`/${locale}/service/${salonId}/${serviceId}/reservation`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#53745D] mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Service non trouvé
          </h2>
          <p className="text-slate-600 mb-6">
            {error || "Ce service n'est plus disponible."}
          </p>
          <button
            onClick={onClose}
            className="bg-[#53745D] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4A6854] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {service.photos && service.photos.length > 0 && (
          <div className="relative w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-500">
            <Image
              src={service.photos[0].url}
              alt={service.name}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {service.name}
            </h2>
            {(service.salon?.name || salonName) && (
              <p className="text-sm text-slate-500 mb-3">
                {service.salon?.name || salonName}
              </p>
            )}
            {minPrice !== null && platformFee !== null && (
              <div className="mx-auto w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-700">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-600">Prestation</span>
                  <span className="font-medium tabular-nums">
                    {formatSalonPriceDollars(minPrice)} $
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between gap-2">
                  <span className="text-slate-600">
                    Frais de réservation ({feePercentLabel}&nbsp;%) et taxes
                  </span>
                  {taxLoading ? (
                    <Loader2
                      className="h-4 w-4 shrink-0 animate-spin text-slate-400"
                      aria-label="Calcul"
                    />
                  ) : totalAcompteEnLigne !== null ? (
                    <span className="font-medium tabular-nums">
                      {formatSalonPriceDollars(totalAcompteEnLigne)} $
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
                {totalGlobal !== null && (
                  <div className="mt-1.5 flex justify-between gap-2 font-semibold text-slate-900">
                    <span>Total</span>
                    <span className="tabular-nums text-[#53745D]">
                      {formatSalonPriceDollars(totalGlobal)} $
                    </span>
                  </div>
                )}
                <p className="mt-2 text-[10px] leading-snug text-slate-500">
                  La prestation est réglée au salon le jour du rendez-vous (sauf
                  indication contraire). Le paiement en ligne couvre uniquement
                  les frais de réservation et les taxes associées.
                </p>
              </div>
            )}
            {service.duration && (
              <p className="mt-3 text-center text-sm text-slate-500">
                Durée indicative : {Math.round(service.duration / 60)}&nbsp;h
              </p>
            )}
          </div>

          <button
            onClick={handleOpenApp}
            className="w-full bg-gradient-to-r from-[#53745D] to-[#3a5a47] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:brightness-110 active:brightness-95 flex items-center justify-center gap-3 mb-3"
          >
            <Smartphone className="w-6 h-6" />
            Ouvrir dans l&apos;app Korí
          </button>

          {service.options &&
            service.options.length > 0 &&
            minPrice !== null && (
              <button
                type="button"
                onClick={handleReserveOnline}
                className="w-full border-2 border-[#53745D] bg-white text-[#53745D] px-6 py-3 rounded-xl font-semibold transition-colors hover:bg-[#F0F4F1] flex items-center justify-center gap-2 mb-4"
              >
                <Globe className="w-5 h-5 shrink-0 pointer-events-none" />
                Réserver en ligne
              </button>
            )}

          <button
            onClick={handleDownload}
            className="w-full bg-slate-100 text-slate-800 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger l&apos;application
          </button>

          <p className="text-xs text-center text-slate-400 mt-4">
            Réservez sur le web ou depuis l&apos;application mobile
          </p>
        </div>
      </div>
    </div>
  );
}
