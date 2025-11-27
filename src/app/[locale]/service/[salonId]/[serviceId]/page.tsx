"use client";

import { Download, Smartphone, X } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
  duration?: number; // en minutes
  salon?: {
    id: string;
    name: string;
  };
  salonId?: string;
}

export default function ServiceSharePage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.salonId as string;
  const serviceId = params.serviceId as string;
  const locale = (params.locale as string) || "fr";

  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);

  // Récupérer le deep link depuis l'URL ou le générer
  const getDeepLink = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const deepLinkParam = urlParams.get("deepLink");
      if (deepLinkParam) {
        return decodeURIComponent(deepLinkParam);
      }
    }
    // Fallback : générer le deep link depuis les paramètres
    return `kori://booking/service-selected?id=${salonId}&serviceId=${serviceId}`;
  };

  const deepLink = getDeepLink();

  useEffect(() => {
    // Récupérer les données du service depuis l'API route Next.js (proxy)
    const fetchService = async () => {
      try {
        setLoading(true);
        // Utiliser l'API route Next.js qui fait le proxy vers le backend
        // L'API route est accessible via /api/service/[salonId]/[serviceId]
        const apiUrl = `${process.env.NEXT_API_URL}/salons/${salonId}/services/${serviceId}`;

        console.log("🔗 Fetching service via Next.js API route:", { apiUrl });

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("Service non trouvé");
        }

        const result = await response.json();

        // Le format de réponse est { success: true, data: service }
        if (result.success && result.data) {
          setService(result.data);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (salonId && serviceId) {
      fetchService();
    }
  }, [salonId, serviceId]);

  const getUserPlatform = () => {
    if (typeof window === "undefined") return "desktop";
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);
    if (isIOS) return "ios";
    if (isAndroid) return "android";
    return "desktop";
  };

  const handleOpenApp = () => {
    if (typeof window === "undefined") return;

    const platform = getUserPlatform();
    console.log("deepLink", deepLink);

    // Méthode améliorée pour ouvrir le deep link
    const openDeepLink = () => {
      // Pour iOS, utiliser window.location
      if (platform === "ios") {
        window.location.href = deepLink;
      }
      // Pour Android, créer un iframe temporaire
      else if (platform === "android") {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = deepLink;
        document.body.appendChild(iframe);
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
      // Pour desktop/autres, utiliser un lien
      else {
        const link = document.createElement("a");
        link.href = deepLink;
        link.click();
      }
    };

    // Essayer d'ouvrir l'app
    openDeepLink();

    // Fallback : après 2 secondes, proposer de télécharger l'app
    const fallbackTimeout = setTimeout(() => {
      if (platform === "ios") {
        window.location.href = "https://apps.apple.com/app/kori/id6754260244";
      } else if (platform === "android") {
        window.location.href =
          "https://play.google.com/store/apps/details?id=com.laguidev.kori";
      } else {
        window.location.href = `/${locale}/download-app`;
      }
    }, 2000);

    // Nettoyer le timeout si l'app s'ouvre (détection via blur)
    window.addEventListener(
      "blur",
      () => {
        clearTimeout(fallbackTimeout);
      },
      { once: true }
    );
  };

  const handleDownload = () => {
    const platform = getUserPlatform();
    if (platform === "ios") {
      window.location.href = "https://apps.apple.com/app/kori/id6754260244";
    } else if (platform === "android") {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.laguidev.kori";
    } else {
      window.location.href = `/${locale}/download-app`;
    }
  };

  const handleClose = () => {
    setShowModal(false);
    router.push(`/${locale}`);
  };

  // Calculer le prix minimum
  const getMinPrice = () => {
    if (!service?.options || service.options.length === 0) return null;
    if (service.options.length === 1) {
      return service.options[0].discountPrice || service.options[0].price;
    }
    return Math.min(...service.options.map((o) => o.discountPrice || o.price));
  };

  const minPrice = getMinPrice();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Service non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Ce service n'existe pas ou n'est plus disponible."}
          </p>
          <button
            onClick={handleClose}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200">
      {/* Overlay cliquable pour fermer */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100">
        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Image du service */}
        {service.photos && service.photos.length > 0 && (
          <div className="relative w-full h-48 bg-gradient-to-br from-green-400 to-teal-500">
            <Image
              src={service.photos[0].url}
              alt={service.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Contenu */}
        <div className="p-6">
          {/* Infos service - très brèves */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {service.name}
            </h2>
            {service.salon && (
              <p className="text-sm text-gray-500 mb-3">{service.salon.name}</p>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              {minPrice && (
                <span className="font-semibold text-green-600 text-lg">
                  {minPrice} $
                </span>
              )}
              {service.duration && (
                <span className="text-gray-500">
                  {Math.round(service.duration / 60)}h
                </span>
              )}
            </div>
          </div>

          {/* CTA Principal - Ouvrir l'app */}
          <button
            onClick={handleOpenApp}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3 mb-4"
          >
            <Smartphone className="w-6 h-6" />
            Ouvrir dans l'app Korí
          </button>

          {/* CTA Secondaire - Télécharger */}
          <button
            onClick={handleDownload}
            className="w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger l'application
          </button>

          {/* Message d'aide */}
          <p className="text-xs text-center text-gray-400 mt-4">
            Réservez directement depuis votre mobile
          </p>
        </div>
      </div>
    </div>
  );
}
