"use client";

import { useGetSalonTypes, useRegisterSalon } from "@/app/data/hooks";
import logo from "@/assets/logo-black.png";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ExtraOfferStep } from "./steps/ExtraOfferStep";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { SalonAddressStep } from "./steps/SalonAddressStep";
import { SalonDescriptionStep } from "./steps/SalonDescriptionStep";
import { SalonHoursStep } from "./steps/SalonHoursStep";
import { SalonImagesStep } from "./steps/SalonImagesStep";
import { SalonNameStep } from "./steps/SalonNameStep";
import { SalonResumeStep } from "./steps/SalonResumeStep";
import { ServicesStep } from "./steps/ServicesStep";
import { SuccessModal } from "./SuccessModal";

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
  { id: "services", title: "Services" },
  { id: "extra-offer", title: "Offre supplémentaire" },
  { id: "salon-address", title: "Adresse" },
  { id: "salon-name", title: "Nom du salon" },
  { id: "salon-description", title: "Description" },
  { id: "salon-hours", title: "Horaires" },
  { id: "salon-images", title: "Images" },
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

  const salonTypes = salonTypesResponse?.data?.salonTypes || [];
  const isDevMode = process.env.NODE_ENV === "development";

  const [formData, setFormData] = useState<FormData>({
    email: isDevMode ? "test@test.com" : "",
    lastName: isDevMode ? "Test" : "",
    firstName: isDevMode ? "Test" : "",
    phone: isDevMode ? "+1234567890" : "",
    countryCode: "+1",
    selectedCountryCode: "CA",
    password: isDevMode ? "Test1234!" : "",
    confirmPassword: isDevMode ? "Test1234!" : "",
    acceptTerms: false,
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
        enabled: true,
        openingTime: "09:00",
        closingTime: "18:00",
      },
      {
        id: "wednesday",
        name: "Mercredi",
        enabled: true,
        openingTime: "09:00",
        closingTime: "18:00",
      },
      {
        id: "thursday",
        name: "Jeudi",
        enabled: true,
        openingTime: "09:00",
        closingTime: "18:00",
      },
      {
        id: "friday",
        name: "Vendredi",
        enabled: true,
        openingTime: "09:00",
        closingTime: "18:00",
      },
      {
        id: "saturday",
        name: "Samedi",
        enabled: true,
        openingTime: "09:00",
        closingTime: "18:00",
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
        ].includes(serviceId)
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

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionStep("Création du salon...");

    try {
      const salonPayload = transformFormDataToSalonPayload(formData);
      console.log("📤 Payload salon:", salonPayload);

      registerSalon(salonPayload, {
        onSuccess: (data) => {
          console.log("✅ Salon créé avec succès:", data);
          setIsSubmitting(false);
          setShowSuccessModal(true);
        },
        onError: (error: any) => {
          console.error("❌ Erreur lors de l'inscription:", error);
          setIsSubmitting(false);
          alert(
            error?.response?.data?.message ||
              error?.message ||
              "Erreur lors de la création du salon"
          );
        },
      });
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      setIsSubmitting(false);
      alert(error?.message || "Erreur lors de la création du salon");
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
      case "services":
        return (
          <ServicesStep
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
      case "extra-offer":
        return (
          <ExtraOfferStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        );
      case "salon-address":
        return (
          <SalonAddressStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        );
      case "salon-name":
        return (
          <SalonNameStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        );
      case "salon-description":
        return (
          <SalonDescriptionStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        );
      case "salon-hours":
        return (
          <SalonHoursStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        );
      case "salon-images":
        return (
          <SalonImagesStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Développez votre activité,
                <span className="relative inline-block ml-2">
                  <span className="relative">
                    rejoignez la communauté korí
                    <span className="absolute bottom-0 left-0 w-full h-2 bg-primary/30 -z-10" />
                  </span>
                </span>
              </h1>
              <p className="mt-6 text-pretty mx-auto max-w-2xl text-lg font-medium text-gray-600 sm:text-xl">
                Créez votre profil professionnel en quelques minutes et
                commencez à recevoir des réservations. Gérez votre salon, vos
                services et vos clients en toute simplicité.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 lg:p-10">
          {renderCurrentStep()}
        </div>
      </main>

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

      {/* Modal de succès - Non fermable */}
      {showSuccessModal && <SuccessModal email={formData.email} />}
    </div>
  );
}
