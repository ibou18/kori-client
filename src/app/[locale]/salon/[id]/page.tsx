"use client";

import { getSalonApi, getSalonServicesApi } from "@/app/data/services";
import { motion } from "framer-motion";
import { ChevronRight, Clock, MapPin, Smartphone, Star } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ServiceDetailModal } from "./components/ServiceDetailModal";

// idsalon=cmipf1upw000j6fo8nni0kaes
const IOS_STORE_URL = "https://apple.co/4lPhmNde";
const ANDROID_STORE_URL = "https://bit.ly/korí-android";

interface ServiceCategory {
  id: string;
  name: string;
}

interface SalonService {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  categoryId?: string;
  category?: ServiceCategory;
  photos?: Array<{ url: string; alt?: string }>;
  options?: Array<{
    id: string;
    price: number;
    discountPrice?: number;
  }>;
}

interface Salon {
  id: string;
  name: string;
  description?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  photos?: Array<{
    id: string;
    url: string;
    alt?: string;
    isMain?: boolean;
  }>;
  salonTypes?: string[];
  services?: SalonService[];
  openingHours?: {
    monday?: { open: string; close: string } | null;
    tuesday?: { open: string; close: string } | null;
    wednesday?: { open: string; close: string } | null;
    thursday?: { open: string; close: string } | null;
    friday?: { open: string; close: string } | null;
    saturday?: { open: string; close: string } | null;
    sunday?: { open: string; close: string } | null;
  };
  rating?: number;
  reviewCount?: number;
}

const getSalonTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    HAIRDRESSER: "Coiffure",
    BARBER: "Barbier",
    MANICURIST: "Manucure",
    NAIL_SALON: "Salon de manucure",
    SPA: "Spa",
    BEAUTY: "Institut de beauté",
  };
  return types[type] || type;
};

const formatOpeningHours = (openingHours?: Salon["openingHours"]) => {
  if (!openingHours) return [];

  const days = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];

  return days.map((day) => {
    const hours = openingHours[day.key as keyof typeof openingHours];
    const isOpen = hours && hours.open && hours.close;
    return {
      day: day.label,
      hours: isOpen ? `${hours.open} - ${hours.close}` : "Fermé",
      isOpen: !!isOpen,
    };
  });
};

export default function SalonSharePage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;
  const locale = (params.locale as string) || "fr";
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasTriedDeepLink, setHasTriedDeepLink] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );

  // Essayer d'ouvrir l'app automatiquement au chargement (avant de récupérer les données)
  useEffect(() => {
    if (!salonId || hasTriedDeepLink) return;

    const tryOpenApp = () => {
      console.log("🚀 Tentative d'ouverture de l'application mobile");
      console.log("📱 Salon ID:", salonId);

      setHasTriedDeepLink(true);
      const deepLink = `kori://salon/salon-detail?id=${salonId}`;

      console.log("🔗 Deep Link généré:", deepLink);
      console.log("🌐 User Agent:", navigator.userAgent);

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      console.log(
        "📱 Plateforme détectée:",
        isIOS ? "iOS" : isAndroid ? "Android" : "Desktop/Web"
      );

      // Essayer d'ouvrir l'app immédiatement
      console.log("⏳ Redirection vers l'application...");
      window.location.href = deepLink;
      console.log("✅ Redirection effectuée");

      // Si l'app ne s'ouvre pas dans les 2 secondes, on laisse la page web s'afficher
      // (pas de redirection automatique vers le store pour ne pas interrompre l'expérience)
    };

    // Essayer d'ouvrir l'app immédiatement au chargement
    console.log("🎯 Initialisation de la redirection vers l'app");
    tryOpenApp();
  }, [salonId, hasTriedDeepLink]);

  // Récupérer les données du salon et des services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salonRes, servicesRes] = await Promise.all([
          getSalonApi(salonId),
          getSalonServicesApi(salonId),
        ]);
        if (salonRes?.success && salonRes?.data) {
          setSalon(salonRes.data);
        } else {
          setError("Salon non trouvé");
        }
        if (servicesRes?.success && servicesRes?.data) {
          setServices(servicesRes.data);
        } else if (salonRes?.success && salonRes?.data?.services) {
          setServices(salonRes.data.services);
        }
      } catch (err: any) {
        console.error("Erreur récupération salon:", err);
        setError("Erreur lors du chargement du salon");
      } finally {
        setLoading(false);
      }
    };

    if (salonId) {
      fetchData();
    }
  }, [salonId]);

  // Carrousel d'images automatique
  useEffect(() => {
    if (!salon?.photos || salon.photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % salon.photos!.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [salon?.photos]);

  const handleOpenApp = () => {
    console.log("👆 Bouton 'Ouvrir dans l'app' cliqué");
    console.log("📱 Salon ID:", salonId);

    const deepLink = `kori://salon/salon-detail?id=${salonId}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const storeUrl = isIOS ? IOS_STORE_URL : ANDROID_STORE_URL;

    console.log("🔗 Deep Link:", deepLink);
    console.log(
      "📱 Plateforme:",
      isIOS ? "iOS" : isAndroid ? "Android" : "Desktop/Web"
    );
    console.log("🏪 Store URL:", storeUrl);

    const start = Date.now();
    console.log("⏱️ Démarrage du timer de fallback (1.5s)");

    const timeoutId = window.setTimeout(() => {
      const elapsed = Date.now() - start;
      console.log(`⏱️ Timer écoulé: ${elapsed}ms`);

      if (elapsed < 2000) {
        console.log("⚠️ L'app ne s'est pas ouverte, redirection vers le store");
        // Si l'app ne s'est pas ouverte, rediriger vers le store
        window.location.href = storeUrl;
      } else {
        console.log("✅ L'app semble s'être ouverte (temps écoulé > 2s)");
      }
    }, 1500);

    // Essayer d'ouvrir l'app
    console.log("⏳ Tentative d'ouverture de l'application...");
    window.location.href = deepLink;
    console.log("✅ Redirection effectuée");

    window.setTimeout(() => {
      window.clearTimeout(timeoutId);
      console.log("🧹 Timer nettoyé");
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center max-w-3xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du salon...</p>
        </div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="min-h-screen flex items-center justify-center max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Salon non trouvé
          </h1>
          <p className="text-slate-600 mb-6">
            {error || "Ce salon n'existe pas"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const salonPhotos = salon.photos?.filter((photo) => photo.url) || [];
  const salonType = salon.salonTypes?.[0]
    ? getSalonTypeLabel(salon.salonTypes[0])
    : "";
  const addressText = salon.address
    ? [salon.address.street, salon.address.city, salon.address.postalCode]
        .filter(Boolean)
        .join(", ")
    : "";
  const openingHours = formatOpeningHours(salon.openingHours);

  return (
    <div className="min-h-screen relative overflow-hidden max-w-3xl mx-auto">
      {/* Subtle Floating Elements */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            background: `linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: Math.random() * 6 + 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header avec nom du salon */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4">
            {salon.name}
          </h1>
          {salonType && (
            <p className="text-xl text-slate-600 mb-2">{salonType}</p>
          )}
          {addressText && (
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <MapPin className="w-5 h-5" />
              <p>{addressText}</p>
            </div>
          )}
          {salon.rating !== undefined && salon.reviewCount !== undefined && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-slate-700 font-semibold">
                {salon.rating.toFixed(1)} ({salon.reviewCount} avis)
              </span>
            </div>
          )}
        </motion.div>

        {/* Carrousel de photos */}
        {salonPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 max-w-3xl mx-auto"
          >
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden bg-white shadow-xl">
              {salonPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: currentImageIndex === index ? 1 : 0,
                    scale: currentImageIndex === index ? 1 : 1.05,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt || salon.name}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </motion.div>
              ))}

              {/* Dots Indicator */}
              {salonPhotos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {salonPhotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentImageIndex === index
                          ? "bg-white scale-125"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Services */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
              Nos services
            </h2>

            {/* Chips de filtrage par catégorie */}
            <div className="mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategoryId === null
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                  }`}
                >
                  Tous
                </button>
                {Array.from(
                  new Map(
                    services
                      .filter((s) => s.category)
                      .map((s) => [s.category!.id, s.category!])
                  ).values()
                ).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategoryId === category.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards en scroll horizontal - 1 par colonne */}
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4 min-w-max">
                {services
                  .filter(
                    (s) =>
                      !selectedCategoryId || s.categoryId === selectedCategoryId
                  )
                  .map((service) => {
                    const minPrice = service.options?.length
                      ? Math.min(
                          ...service.options.map(
                            (o) => o.discountPrice ?? o.price
                          )
                        )
                      : null;
                    return (
                      <motion.button
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className="text-left bg-white/90 backdrop-blur border border-slate-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all w-[200px] flex-shrink-0"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {service.photos?.[0]?.url ? (
                          <div className="relative h-28 w-full">
                            <Image
                              src={service.photos[0].url}
                              alt={service.name}
                              fill
                              className="object-cover"
                              sizes="200px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="font-semibold text-white text-sm line-clamp-2 drop-shadow">
                                {service.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {minPrice !== null && (
                                  <span className="text-white font-bold text-sm drop-shadow">
                                    {minPrice} $
                                  </span>
                                )}
                                {service.duration && (
                                  <span className="text-white/90 text-xs drop-shadow">
                                    {Math.round(service.duration / 60)}h
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4">
                            <p className="font-semibold text-slate-800 text-sm line-clamp-2">
                              {service.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {minPrice !== null && (
                                <span className="text-blue-600 font-bold text-sm">
                                  {minPrice} $
                                </span>
                              )}
                              {service.duration && (
                                <span className="text-slate-500 text-xs">
                                  {Math.round(service.duration / 60)}h
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="p-2 flex items-center justify-end">
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </motion.button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal détail service */}
        {selectedServiceId && (
          <ServiceDetailModal
            salonId={salonId}
            serviceId={selectedServiceId}
            salonName={salon?.name}
            locale={locale}
            onClose={() => setSelectedServiceId(null)}
          />
        )}

        {/* A propos */}
        {salon.description && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 max-w-3xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                À propos
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {salon.description}
              </p>
            </div>
          </motion.div>
        )}

        {/* Horaires d'ouverture */}
        {openingHours.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8  mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Horaires d'ouverture
              </h2>
              <div className="space-y-2">
                {openingHours.map((day, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0"
                  >
                    <span className="text-slate-700 font-medium">
                      {day.day}
                    </span>
                    <span
                      className={`font-semibold ${
                        day.isOpen ? "text-green-600" : "text-slate-400"
                      }`}
                    >
                      {day.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center  mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl p-8 shadow-lg mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
              Réservez vos services
            </h3>
            <p className="text-slate-600 mb-6">
              Ouvrez l'application korí pour découvrir tous les services et
              réserver votre rendez-vous.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <motion.button
                onClick={handleOpenApp}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Smartphone className="w-5 h-5" />
                Ouvrir dans l'app
              </motion.button>
            </div>

            {/* Store Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={IOS_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <Image
                  src="/assets/apple.png"
                  alt="Download on the App Store"
                  width={180}
                  height={54}
                  className="h-12 w-auto object-contain"
                />
              </a>
              <a
                href={ANDROID_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <Image
                  src="/assets/android.png"
                  alt="Get it on Google Play"
                  width={200}
                  height={60}
                  className="h-12 w-auto object-contain"
                />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
