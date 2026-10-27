"use client";

import { useGetSalonTypes, useRegisterSalon } from "@/app/data/hooks";
import { uploadSalonImagesApi } from "@/app/data/services";
import { trackMetaConversion } from "@/components/MetaPixel";
import { trackTikTokConversion } from "@/components/TikTokPixel";
import icon from "@/assets/icon.png";
import logo from "@/assets/logo-black.png";
import {
  getProviderRegisterErrorMessage,
  transformFormDataToSalonPayload,
} from "@/utils/providerRegisterValidation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { SalonInfoStep } from "./steps/SalonInfoStep";
import { SalonResumeStep } from "./steps/SalonResumeStep";
import { SuccessModal } from "./SuccessModal";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

// Types pour les données du formulaire
interface FormData {
  // Étape 1: Informations personnelles
  email: string;
  lastName: string;
  firstName: string;
  phone: string;
  countryCode: string;
  selectedCountryCode?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;

  // Étape 2: Services
  services: string[];

  // Étape 3: Offre supplémentaire
  extraOffer: "yes" | "no";

  // Collecte d'acompte (opt-in ; effectif après onboarding Stripe Connect)
  collectDeposit: "yes" | "no";

  // Étape 4: Nom du salon
  salonName: string;

  // Étape 5: Description du salon
  salonDescription: string;

  // Étape 6: Horaires du salon
  salonHours: {
    id: string;
    name: string;
    enabled: boolean;
    openingTime: string;
    closingTime: string;
  }[];

  // Étape 7: Images du salon
  salonImages: File[];

  // Étape 8: Adresse du salon
  salonAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    apartment?: string;
    latitude?: number;
    longitude?: number;
    formattedAddress?: string;
  } | null;
}

const STEPS = [
  { id: "personal", title: "Informations personnelles" },
  { id: "salon-info", title: "Informations du salon" },
  { id: "salon-resume", title: "Résumé" },
];

export function ProviderRegisterForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { mutate: registerSalon, isPending } = useRegisterSalon();
  const { data: salonTypesResponse, isLoading: isLoadingSalonTypes } =
    useGetSalonTypes();
  const formRef = useRef<HTMLElement>(null);
  const hasScrolledRef = useRef(false);

  const salonTypes = salonTypesResponse?.data?.salonTypes || [];
  const isDevMode = process.env.NODE_ENV === "development";

  const [formData, setFormData] = useState<FormData>({
    email: isDevMode ? "test@test.com" : "",
    lastName: isDevMode ? "Test" : "",
    firstName: isDevMode ? "Test" : "",
    phone: isDevMode ? "2345678922" : "",
    countryCode: "+1",
    selectedCountryCode: "CA",
    password: isDevMode ? "Test1234!" : "",
    confirmPassword: isDevMode ? "Test1234!" : "",
    acceptTerms: isDevMode ? true : false,
    services: isDevMode
      ? [
          "HAIRDRESSER",
          "BARBER",
          "NAIL_SALON",
          "MAQUILLAGE",
          "CILS",
          "BODY_CARE",
        ]
      : [],
    extraOffer: "no",
    collectDeposit: "no",
    salonName: isDevMode ? "Test Salon" : "",
    salonDescription: isDevMode ? "Test Description" : "",
    salonHours: [
      {
        id: "monday",
        name: "Lundi",
        enabled: false,
        openingTime: "",
        closingTime: "",
      },
      {
        id: "tuesday",
        name: "Mardi",
        enabled: false,
        openingTime: "",
        closingTime: "",
      },
      {
        id: "wednesday",
        name: "Mercredi",
        enabled: false,
        openingTime: "",
        closingTime: "",
      },
      {
        id: "thursday",
        name: "Jeudi",
        enabled: false,
        openingTime: "",
        closingTime: "",
      },
      {
        id: "friday",
        name: "Vendredi",
        enabled: false,
        openingTime: "",
        closingTime: "",
      },
      {
        id: "saturday",
        name: "Samedi",
        enabled: false,
        openingTime: "",
        closingTime: "",
      },
      {
        id: "sunday",
        name: "Dimanche",
        enabled: false,
        openingTime: "",
        closingTime: "",
      },
    ],
    salonImages: [],
    salonAddress: null,
  });

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Défilement automatique vers le formulaire après 5 secondes (une seule fois au chargement, étape 0)
  useEffect(() => {
    if (currentStep === 0 && !hasScrolledRef.current) {
      const timer = setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        hasScrolledRef.current = true;
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // À chaque changement d'étape (1, 2...), remonter en haut du formulaire pour voir le début de l'étape
  useEffect(() => {
    if (currentStep > 0) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Fonction utilitaire pour convertir File en base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1]; // Retirer le préfixe data:image/...
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFinalSubmit = async () => {
    if (!formData.salonName?.trim()) {
      toast.error("Veuillez indiquer le nom de votre salon", {
        description: "Le nom du salon est obligatoire pour créer votre compte.",
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep("Création du salon...");

    try {
      const salonPayload = transformFormDataToSalonPayload(formData);

      registerSalon(salonPayload, {
        onSuccess: async (data) => {
          // Upload des images si elles existent
          if (formData.salonImages.length > 0 && data?.data?.salon?.id) {
            try {
              setSubmissionStep("Upload des images...");

              // Convertir les fichiers en base64
              const imagesPromises = formData.salonImages.map(
                async (file, index) => {
                  const base64 = await fileToBase64(file);
                  return {
                    base64,
                    fileName: file.name,
                    mimeType: file.type,
                    order: index,
                    isMain: index === 0, // La première image est la principale
                  };
                },
              );

              const images = await Promise.all(imagesPromises);

              // Upload des images
              const uploadResponse = await uploadSalonImagesApi({
                salonId: data.data.salon.id,
                images,
              });

              if (uploadResponse) {
                toast.success("Images uploadées avec succès");
              } else {
                toast.warning("Les images n'ont pas pu être uploadées", {
                  description:
                    "Vous pourrez les ajouter plus tard depuis votre espace.",
                });
              }
            } catch (uploadError: any) {
              console.error(
                "❌ Erreur lors de l'upload des images:",
                uploadError,
              );
              // On continue quand même, l'upload des images n'est pas bloquant
              toast.warning("Erreur lors de l'upload des images", {
                description:
                  "Vous pourrez les ajouter plus tard depuis votre espace.",
              });
            }
          }

          setIsSubmitting(false);
          
          // Tracker la conversion TikTok et Meta Pixel
          const phoneNumber = formData.countryCode + formData.phone;
          trackTikTokConversion(formData.email, phoneNumber);
          trackMetaConversion(formData.email, phoneNumber);
          
          setShowSuccessModal(true);
        },
        onError: (error: any) => {
          console.error("❌ Erreur lors de l'inscription:", error);
          setIsSubmitting(false);

          // Extraire le message d'erreur de manière intelligente
          const errorMessage = getProviderRegisterErrorMessage(error);

          toast.error("Erreur lors de l'inscription", {
            description: errorMessage,
            duration: 6000,
          });
        },
      });
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      setIsSubmitting(false);

      const errorMessage = getProviderRegisterErrorMessage(error);
      toast.error("Erreur inattendue", {
        description: errorMessage,
        duration: 6000,
      });
    }
  };

  const renderCurrentStep = () => {
    switch (STEPS[currentStep].id) {
      case "personal":
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        );
      case "salon-info":
        return (
          <SalonInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            salonTypes={salonTypes}
            isLoading={isLoadingSalonTypes}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        );
      case "salon-resume":
        return (
          <SalonResumeStep
            formData={formData}
            onFinalSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting || isPending}
            submissionStep={submissionStep}
            onPrev={prevStep}
            salonTypes={salonTypes}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F1E8] font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-900/5 bg-[#F7F1E8]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logo}
              alt="korí"
              width={500}
              height={500}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
              <Sparkles className="size-3.5" />
              Gratuit pour les pros · 0 $
            </span>
            {currentStep === 0 ? (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Déjà un compte ?{" "}
                <span className="text-primary">Se connecter</span>
              </Link>
            ) : (
              <button
                onClick={() => router.push("/")}
                className="flex size-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
                aria-label="Quitter l'inscription"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Submission Status */}
      {isSubmitting && (
        <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            <Loader2 className="size-4 animate-spin" />
            {submissionStep}
          </div>
        </div>
      )}

      {/* Hero - première étape uniquement */}
      {currentStep === 0 && (
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#D9A441]/20 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Inscription gratuite · 2 minutes
              </span>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Développez votre activité,{" "}
                <span className="relative inline-block">
                  rejoignez la communauté{" "}
                  <span className="text-primary">korí.</span>
                  <motion.span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-[0.12em] w-full origin-left rounded-full bg-[#D9A441]/70"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-lg text-gray-600">
                Créez votre profil professionnel et commencez à recevoir des
                réservations. Agenda, rappels, acomptes : tout est inclus.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                {[
                  "0 $ d'abonnement",
                  "Sans engagement",
                  "Aucune carte bancaire",
                ].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="size-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>
      )}

      {/* Formulaire + colonne latérale */}
      <main
        ref={formRef}
        className="mx-auto w-full max-w-6xl flex-1 scroll-mt-20 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-gray-900/5 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(42,55,49,0.25)] md:p-10"
          >
            {renderCurrentStep()}
          </motion.div>

          <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block">
            <div className="relative overflow-hidden rounded-3xl bg-[#2A3731] p-6 text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[#D9A441]/25 blur-2xl"
              />
              <Image src={icon} alt="" width={40} height={40} className="size-10" />
              <p className="mt-4 text-4xl font-semibold tracking-tight">
                0&nbsp;$
                <span className="ml-2 text-sm font-normal text-white/60">
                  / mois, pour toujours
                </span>
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-white/85">
                {[
                  "Agenda en ligne et rappels SMS",
                  "Acompte sécurisé à la réservation",
                  "Page salon partageable en un lien",
                  "Gestion de votre équipe",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#D9A441]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-gray-900/5 bg-white p-5">
              <p className="text-sm font-semibold text-gray-900">
                Une question avant de commencer ?
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Notre équipe vous répond rapidement.
              </p>
              <Link
                href="/support"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Contacter le support
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Commentaire client */}
      {currentStep === 0 && <TestimonialsCarousel />}

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-900/5 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            En créant un compte, vous acceptez nos{" "}
            <Link
              href="/terms/cgu-pro"
              className="text-primary hover:underline"
            >
              conditions d&apos;utilisation
            </Link>{" "}
            et notre{" "}
            <Link
              href="/terms/privacy-policy"
              className="text-primary hover:underline"
            >
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </footer>

      {/* Modal de succès - Bloquée 10 secondes puis fermable */}
      {showSuccessModal && (
        <SuccessModal
          email={formData.email}
          onClose={() => {
            setShowSuccessModal(false);
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
