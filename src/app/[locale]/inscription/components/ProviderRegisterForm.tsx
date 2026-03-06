"use client";

import { useGetSalonTypes, useRegisterSalon } from "@/app/data/hooks";
import { uploadSalonImagesApi } from "@/app/data/services";
import icon from "@/assets/icon.png";
import logo from "@/assets/logo-black.png";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
// import { SalonDetailsStep } from "./steps/SalonDetailsStep";
// import { SalonImagesStep } from "./steps/SalonImagesStep";
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
  // { id: "salon-details", title: "Détails du salon" },
  // { id: "salon-images", title: "Images" },
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

  // Défilement automatique vers le formulaire après 5 secondes (une seule fois au chargement)
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

  const transformFormDataToSalonPayload = (data: FormData) => {
    const getDayHours = (dayId: string) => {
      const day = data.salonHours.find((d) => d.id === dayId);
      if (!day?.enabled || !day.openingTime || !day.closingTime) {
        return null;
      }
      return { open: day.openingTime, close: day.closingTime };
    };

    const openingHours = {
      monday: getDayHours("monday"),
      tuesday: getDayHours("tuesday"),
      wednesday: getDayHours("wednesday"),
      thursday: getDayHours("thursday"),
      friday: getDayHours("friday"),
      saturday: getDayHours("saturday"),
      sunday: getDayHours("sunday"),
    };

    const getSalonTypes = (services: string[]): string[] => {
      return services.filter((serviceId) =>
        [
          "HAIRDRESSER",
          "BARBER",
          "NAIL_SALON",
          "MAQUILLAGE",
          "CILS",
          "BODY_CARE",
        ].includes(serviceId),
      );
    };

    return {
      user: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.countryCode + data.phone,
        countryCode: data.countryCode,
        password: data.password,
      },
      salon: {
        name: data.salonName,
        description: data.salonDescription,
        address: data.salonAddress || {
          street: "À définir",
          city: "À définir",
          postalCode: "À définir",
          country: "Canada",
        },
        phone: data.countryCode + data.phone,
        email: data.email,
        salonTypes: getSalonTypes(data.services),
        services: data.services,
        extraOffer: data.extraOffer,
      },
      openingHours,
    };
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
      console.log("📤 Payload salon:", salonPayload);

      registerSalon(salonPayload, {
        onSuccess: async (data) => {
          console.log("✅ Salon créé avec succès:", data);

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
                console.log("✅ Images uploadées avec succès:", uploadResponse);
                toast.success("Images uploadées avec succès");
              } else {
                console.warn("⚠️ Aucune réponse lors de l'upload des images");
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
          setShowSuccessModal(true);
        },
        onError: (error: any) => {
          console.error("❌ Erreur lors de l'inscription:", error);
          setIsSubmitting(false);

          // Extraire le message d'erreur de manière intelligente
          const errorMessage = getErrorMessage(error);

          toast.error("Erreur lors de l'inscription", {
            description: errorMessage,
            duration: 6000,
          });
        },
      });
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      setIsSubmitting(false);

      const errorMessage = getErrorMessage(error);
      toast.error("Erreur inattendue", {
        description: errorMessage,
        duration: 6000,
      });
    }
  };

  // Fonction pour extraire un message d'erreur lisible
  const getErrorMessage = (error: any): string => {
    // Vérifier les erreurs Prisma (contrainte unique)
    // Vérifier dans plusieurs emplacements possibles
    const prismaError =
      error?.response?.data?.prismaError ||
      error?.prismaError ||
      (error?.code === "P2002" ? error : null);

    if (prismaError?.code === "P2002") {
      const target = prismaError?.meta?.target || [];
      if (Array.isArray(target)) {
        if (target.includes("phone")) {
          return "Ce numéro de téléphone est déjà utilisé. Veuillez utiliser un autre numéro ou vous connecter si vous avez déjà un compte.";
        }
        if (target.includes("email")) {
          return "Cette adresse email est déjà utilisée. Essayez de vous connecter si vous avez déjà un compte.";
        }
      }
      // Erreur de contrainte unique générique
      return "Ces informations sont déjà utilisées par un autre compte. Veuillez vérifier vos données ou vous connecter.";
    }

    // Messages d'erreur personnalisés selon le code d'erreur
    const errorCode = error?.response?.data?.errorCode || error?.errorCode;

    const errorMessages: Record<string, string> = {
      EMAIL_ALREADY_EXISTS:
        "Cette adresse email est déjà utilisée. Essayez de vous connecter.",
      PHONE_ALREADY_EXISTS:
        "Ce numéro de téléphone est déjà utilisé. Veuillez utiliser un autre numéro ou vous connecter si vous avez déjà un compte.",
      SALON_EMAIL_ALREADY_EXISTS:
        "L'email du salon est déjà utilisé par un autre établissement.",
      INVALID_PASSWORD:
        "Le mot de passe ne respecte pas les critères de sécurité.",
      VALIDATION_ERROR: "Veuillez vérifier les informations saisies.",
      USER_NOT_FOUND: "Utilisateur non trouvé.",
      NETWORK_ERROR:
        "Problème de connexion. Vérifiez votre connexion internet.",
    };

    if (errorCode && errorMessages[errorCode]) {
      return errorMessages[errorCode];
    }

    // Vérifier si le message d'erreur contient des indices sur la contrainte unique
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      error?.errorDetails?.message ||
      "";

    if (errorMessage) {
      // Détecter les erreurs de contrainte unique dans le message
      if (
        errorMessage.toLowerCase().includes("unique constraint") ||
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("déjà utilisé")
      ) {
        if (
          errorMessage.toLowerCase().includes("phone") ||
          errorMessage.toLowerCase().includes("téléphone")
        ) {
          return "Ce numéro de téléphone est déjà utilisé. Veuillez utiliser un autre numéro ou vous connecter si vous avez déjà un compte.";
        }
        if (
          errorMessage.toLowerCase().includes("email") ||
          errorMessage.toLowerCase().includes("courriel")
        ) {
          return "Cette adresse email est déjà utilisée. Essayez de vous connecter si vous avez déjà un compte.";
        }
      }
      return errorMessage;
    }

    return "Une erreur est survenue. Veuillez réessayer.";
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
      // case "salon-details":
      //   return (
      //     <SalonDetailsStep
      //       formData={formData}
      //       updateFormData={updateFormData}
      //       onNext={nextStep}
      //       onPrev={prevStep}
      //       currentStep={currentStep}
      //       totalSteps={STEPS.length}
      //     />
      //   );
      // case "salon-images":
      //   return (
      //     <SalonImagesStep
      //       formData={formData}
      //       updateFormData={updateFormData}
      //       onNext={nextStep}
      //       onPrev={prevStep}
      //       currentStep={currentStep}
      //       totalSteps={STEPS.length}
      //     />
      //   );
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FEFCF9] via-white to-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src={logo}
                  alt="korí"
                  width={500}
                  height={500}
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            {currentStep > 0 && (
              <button
                onClick={() => router.push("/")}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Submission Status */}
      {isSubmitting && (
        <div className="bg-primary/10 border-l-4 border-primary max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-primary font-medium text-sm">{submissionStep}</p>
        </div>
      )}

      {/* Hero Section - Only on first step */}
      {currentStep === 0 && (
        <div className="">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            {/* Icône Kori animée - Mobile (en haut) */}
            {/* <motion.div
              className="flex justify-center mb-6 lg:hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                animate={{
                  rotate: [-0.5, 0.5, -0.5, 0.5, -0.3, 0.3, 0],
                  x: [-0.3, 0.3, -0.3, 0.3, 0],
                  y: [-0.3, 0.3, -0.3, 0.3, 0],
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  rotate: {
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  x: {
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  y: {
                    duration: 0.65,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="relative"
              >
                <Image
                  src={icon}
                  alt="Kori"
                  width={80}
                  height={80}
                  className="w-16 h-16"
                />
              </motion.div>
            </motion.div> */}

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
              {/* Icône Kori animée - Desktop (à gauche) */}
              <motion.div
                className="flex-shrink-0 hidden lg:block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  animate={{
                    rotate: [-0.5, 0.5, -0.5, 0.5, -0.3, 0.3, 0],
                    x: [-0.3, 0.3, -0.3, 0.3, 0],
                    y: [-0.3, 0.3, -0.3, 0.3, 0],
                    scale: [1, 1.03, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    x: {
                      duration: 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    y: {
                      duration: 0.65,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    scale: {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="relative"
                >
                  <Image
                    src={icon}
                    alt="Kori"
                    width={120}
                    height={120}
                    className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
                  />
                </motion.div>
              </motion.div>

              {/* Contenu texte */}
              <div className="flex-1 text-center lg:text-left">
                <motion.h1
                  className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  Développez votre activité,
                  <motion.span
                    className="relative inline-block ml-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  >
                    <span className="relative">
                      rejoignez la communauté{" "}
                      <span className="font-semibold text-primary">korí.</span>
                      <motion.span
                        className="absolute bottom-0 left-0 w-full h-2 bg-primary/30 -z-10"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: 0.8,
                          delay: 0.6,
                          ease: "easeOut",
                        }}
                        style={{ transformOrigin: "left" }}
                      />
                    </span>
                  </motion.span>
                </motion.h1>
                <motion.p
                  className="mt-6 text-pretty mx-auto lg:mx-0 max-w-2xl text-lg font-medium text-gray-600 sm:text-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                >
                  Créez votre profil professionnel et commencez à recevoir des
                  réservations. Gérez votre salon, vos services et vos clients
                  en toute simplicité.
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        ref={formRef}
        className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-0 py-2">
          <h1 className="text-xl font-bold text-primary">
            Formulaire d&apos;inscription
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 lg:p-10 mx-auto">
          {renderCurrentStep()}
        </div>
      </main>

      {/* Commentaire client */}
      {currentStep === 0 && <TestimonialsCarousel />}

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
