"use client";

import { getSalonServiceByIdApi } from "@/app/data/services";
import { Download, Smartphone, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  salon?: { id: string; name: string };
  salonId?: string;
}

interface ServiceDetailModalProps {
  salonId: string;
  serviceId: string;
  salonName?: string;
  locale?: string;
  onClose: () => void;
}

const IOS_STORE_URL = "https://apple.co/4lPhmNde";
const ANDROID_STORE_URL = "https://bit.ly/korí-android";

export function ServiceDetailModal({
  salonId,
  serviceId,
  salonName,
  locale = "fr",
  onClose,
}: ServiceDetailModalProps) {
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      if (platform === "ios") window.location.href = IOS_STORE_URL;
      else if (platform === "android")
        window.location.href = ANDROID_STORE_URL;
      else window.location.href = `/${locale}/download-app`;
    }, 2000);
    window.addEventListener("blur", () => clearTimeout(fallback), { once: true });
  };

  const handleDownload = () => {
    const platform = getUserPlatform();
    if (platform === "ios") window.location.href = IOS_STORE_URL;
    else if (platform === "android")
      window.location.href = ANDROID_STORE_URL;
    else window.location.href = `/${locale}/download-app`;
  };

  const getMinPrice = () => {
    if (!service?.options || service.options.length === 0) return null;
    if (service.options.length === 1)
      return service.options[0].discountPrice || service.options[0].price;
    return Math.min(...service.options.map((o) => o.discountPrice || o.price));
  };

  const minPrice = getMinPrice();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
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
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
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
            <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
              {minPrice !== null && (
                <span className="font-semibold text-blue-600 text-lg">
                  {minPrice} $
                </span>
              )}
              {service.duration && (
                <span className="text-slate-500">
                  {Math.round(service.duration / 60)}h
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleOpenApp}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 mb-4 shadow-lg"
          >
            <Smartphone className="w-6 h-6" />
            Ouvrir dans l&apos;app Korí
          </button>

          <button
            onClick={handleDownload}
            className="w-full bg-slate-100 text-slate-800 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger l&apos;application
          </button>

          <p className="text-xs text-center text-slate-400 mt-4">
            Réservez directement depuis votre mobile
          </p>
        </div>
      </div>
    </div>
  );
}
