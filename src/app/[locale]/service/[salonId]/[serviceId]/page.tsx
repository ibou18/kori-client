"use client";

import { Download, ExternalLink, Smartphone } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
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
  const salonId = params.salonId as string;
  const serviceId = params.serviceId as string;
  const locale = (params.locale as string) || "fr";

  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Récupérer les données du service depuis l'API
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://kori-server-production.up.railway.app/api/salons/${salonId}/services/${serviceId}`
        );

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

  const handleOpenApp = () => {
    if (typeof window === "undefined") return;

    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);

    // Méthode améliorée pour ouvrir le deep link
    const openDeepLink = () => {
      // Pour iOS, utiliser window.location
      if (isIOS) {
        window.location.href = deepLink;
      }
      // Pour Android, créer un iframe temporaire
      else if (isAndroid) {
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
      if (isIOS) {
        window.location.href = "https://apps.apple.com/app/kori/id6754260244"; // À remplacer par votre App Store ID
      } else if (isAndroid) {
        window.location.href =
          "https://play.google.com/store/apps/details?id=com.laguidev.kori";
      } else {
        // Desktop : rediriger vers la page de téléchargement
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du service...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Service non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Ce service n'existe pas ou n'est plus disponible."}
          </p>
          <a
            href={`/${locale}`}
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {service.name}
          </h1>
          {service.salon && (
            <p className="text-lg text-gray-600">chez {service.salon.name}</p>
          )}
          {!service.salon && service.salonId && (
            <p className="text-lg text-gray-600">Service disponible</p>
          )}
        </div>

        {/* Image du service */}
        {service.photos && service.photos.length > 0 && (
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={service.photos[0].url}
              alt={service.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Informations du service */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {service.description && (
            <p className="text-gray-700 mb-4">{service.description}</p>
          )}

          {service.particularities && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
              <p className="text-gray-700 font-semibold mb-1">Particularités</p>
              <p className="text-gray-600 text-sm">{service.particularities}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {service.duration && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Durée:</span>
                <span>{Math.round(service.duration / 60)}h</span>
              </div>
            )}
            {service.options && service.options.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Prix:</span>
                <span>
                  {service.options.length === 1
                    ? `${
                        service.options[0].discountPrice ||
                        service.options[0].price
                      } $`
                    : "À partir de " +
                      Math.min(
                        ...service.options.map(
                          (o) => o.discountPrice || o.price
                        )
                      ) +
                      " $"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CTA - Ouvrir dans l'app */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Réservez ce service dans l'app Korí
            </h2>
            <p className="text-gray-600 mb-6">
              Ouvrez l'application mobile pour sélectionner votre prestation et
              réserver
            </p>
          </div>

          <button
            onClick={handleOpenApp}
            className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3 mb-4"
          >
            <ExternalLink className="w-5 h-5" />
            Ouvrir dans l'app Korí
          </button>

          <div className="text-sm text-gray-500 mb-6">ou</div>

          {/* Liens de téléchargement */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://apps.apple.com/app/kori/id6754260244"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              <Download className="w-5 h-5" />
              Télécharger pour iOS
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.laguidev.kori"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Télécharger pour Android
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Vous n'avez pas l'app ?{" "}
            <a
              href={`/${locale}/download-app`}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Téléchargez-la ici
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
