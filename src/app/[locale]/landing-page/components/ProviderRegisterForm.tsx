"use client";

import { useGetSalonTypes, useRegisterSalon } from "@/app/data/hooks";
import logo from "@/assets/logo-black.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormattedPhoneInput,
  usePhoneValidation,
} from "@/components/ui/FormattedPhoneInput";
import {
  AddressData,
  GoogleAddressAutocomplete,
} from "@/components/ui/GoogleAddressAutocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Smartphone,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

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
  const isDevMode = true;

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
        enabled: false,
        openingTime: "09:00",
        closingTime: "18:00",
      },
      {
        id: "wednesday",
        name: "Mercredi",
        enabled: false,
        openingTime: "09:00",
        closingTime: "18:00",
      },
      {
        id: "thursday",
        name: "Jeudi",
        enabled: false,
        openingTime: "09:00",
        closingTime: "18:00",
      },
      {
        id: "friday",
        name: "Vendredi",
        enabled: false,
        openingTime: "09:00",
        closingTime: "18:00",
      },
      {
        id: "saturday",
        name: "Samedi",
        enabled: false,
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

  // Composant pour afficher la progression
  const ProgressIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">
          {STEPS[currentStep].title}
        </span>
        <span className="text-xs text-gray-500">
          {currentStep + 1}/{STEPS.length}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / STEPS.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (STEPS[currentStep].id) {
      case "personal":
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            progressIndicator={<ProgressIndicator />}
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
            progressIndicator={<ProgressIndicator />}
          />
        );
      case "extra-offer":
        return (
          <ExtraOfferStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            progressIndicator={<ProgressIndicator />}
          />
        );
      case "salon-address":
        return (
          <SalonAddressStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            progressIndicator={<ProgressIndicator />}
          />
        );
      case "salon-name":
        return (
          <SalonNameStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            progressIndicator={<ProgressIndicator />}
          />
        );
      case "salon-description":
        return (
          <SalonDescriptionStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            progressIndicator={<ProgressIndicator />}
          />
        );
      case "salon-hours":
        return (
          <SalonHoursStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            progressIndicator={<ProgressIndicator />}
          />
        );
      case "salon-images":
        return (
          <SalonImagesStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            progressIndicator={<ProgressIndicator />}
          />
        );
      case "salon-resume":
        return (
          <SalonResumeStep
            formData={formData}
            updateFormData={updateFormData}
            onFinalSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting || isPending}
            submissionStep={submissionStep}
            onPrev={prevStep}
            salonTypes={salonTypes}
            progressIndicator={<ProgressIndicator />}
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
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center relative animate-in fade-in zoom-in duration-300">
            {/* Pas de bouton de fermeture - Modal non fermable */}

            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Félicitations ! 🎉
              </h2>
              <p className="text-gray-600 text-lg">
                Votre salon a été créé avec succès !
              </p>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 text-base leading-relaxed">
                Pour commencer à gérer votre salon et recevoir des réservations,
                téléchargez l&apos;application mobile korí.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <a
                href="https://apps.apple.com/app/kori/id6754260244"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-black text-white rounded-xl px-6 py-4 hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
              >
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs opacity-90">Télécharger sur</div>
                  <div className="font-bold text-lg">App Store</div>
                </div>
                <Download className="w-5 h-5 ml-auto" />
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.laguidev.kori"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#0F9D58] text-white rounded-xl px-6 py-4 hover:bg-[#0d8a4c] transition-all transform hover:scale-105 shadow-lg"
              >
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs opacity-90">Télécharger sur</div>
                  <div className="font-bold text-lg">Google Play</div>
                </div>
                <Download className="w-5 h-5 ml-auto" />
              </a>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong className="text-blue-900">💡 Astuce :</strong> Une fois
                l&apos;application installée, connectez-vous avec votre email{" "}
                <span className="font-semibold">{formData.email}</span> pour
                commencer à utiliser votre compte.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour l'étape des informations personnelles
function PersonalInfoStep({
  formData,
  updateFormData,
  onNext,
  progressIndicator,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  progressIndicator?: React.ReactNode;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isValid: isPhoneValid, errorMessage: phoneError } =
    usePhoneValidation(formData.phone, formData.countryCode);

  const handleValidate = () => {
    if (!formData.email.trim()) {
      alert("L'email est requis");
      return;
    }
    if (!formData.lastName.trim()) {
      alert("Le nom est requis");
      return;
    }
    if (!formData.firstName.trim()) {
      alert("Le prénom est requis");
      return;
    }
    if (!formData.phone.trim()) {
      alert("Le numéro de téléphone est requis");
      return;
    }
    if (!isPhoneValid) {
      alert(phoneError || "Format de téléphone invalide");
      return;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    if (!formData.acceptTerms) {
      alert("Vous devez accepter les conditions d'utilisation");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {progressIndicator}
      <div>
        <p className="text-gray-600">
          Commencez par remplir vos informations personnelles
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              placeholder="Votre nom"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              placeholder="Votre prénom"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <FormattedPhoneInput
          value={formData.phone}
          countryCode={formData.countryCode}
          selectedCountryCode={formData.selectedCountryCode || "CA"}
          onPhoneChange={(phone: string) => updateFormData({ phone })}
          onCountryCodeChange={(dialCode: string, isoCode: string) =>
            updateFormData({
              countryCode: dialCode,
              selectedCountryCode: isoCode,
            })
          }
          error={
            formData.phone.trim() && !isPhoneValid
              ? phoneError || undefined
              : undefined
          }
          label="Téléphone"
          required
          id="phone"
        />

        <div>
          <Label htmlFor="password">Mot de passe *</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 caractères"
              value={formData.password}
              onChange={(e) => updateFormData({ password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmez votre mot de passe"
              value={formData.confirmPassword}
              onChange={(e) =>
                updateFormData({ confirmPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            checked={formData.acceptTerms}
            onChange={(checked: boolean) =>
              updateFormData({ acceptTerms: checked })
            }
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 leading-relaxed cursor-pointer"
            onClick={() =>
              updateFormData({ acceptTerms: !formData.acceptTerms })
            }
          >
            J&apos;accepte la{" "}
            <Link
              href="/terms/privacy-policy"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              politique de confidentialité
            </Link>
            , les{" "}
            <Link
              href="/terms/cgv"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              conditions générales
            </Link>{" "}
            et les{" "}
            <Link
              href="/terms/cgu-pro"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              conditions de service
            </Link>
            .
          </label>
        </div>

        <Button
          onClick={handleValidate}
          className="w-full"
          disabled={
            !formData.email.trim() ||
            !formData.lastName.trim() ||
            !formData.firstName.trim() ||
            !formData.phone.trim() ||
            !formData.password.trim() ||
            !formData.confirmPassword.trim() ||
            !formData.acceptTerms
          }
        >
          Continuer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour l'étape des services
function ServicesStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  salonTypes,
  isLoading,
  progressIndicator,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  salonTypes: any[];
  isLoading: boolean;
  progressIndicator?: React.ReactNode;
}) {
  const handleServiceSelect = (serviceId: string) => {
    const isCurrentlySelected = formData.services.includes(serviceId);
    if (isCurrentlySelected) {
      updateFormData({
        services: formData.services.filter((id) => id !== serviceId),
      });
    } else {
      updateFormData({ services: [...formData.services, serviceId] });
    }
  };

  const handleValidate = () => {
    if (formData.services.length === 0) {
      alert("Veuillez sélectionner au moins un service");
      return;
    }
    onNext();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {progressIndicator}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Quelle prestation voulez-vous offrir ?
        </h2>
        <p className="text-gray-600">
          Vous pouvez choisir une ou plusieurs prestations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {salonTypes.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              formData.services.includes(service.id)
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-gray-600">{service.description}</p>
                )}
              </div>
              {formData.services.includes(service.id) && (
                <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button
          onClick={handleValidate}
          className="flex-1"
          disabled={formData.services.length === 0}
        >
          Continuer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour l'étape offre supplémentaire
function ExtraOfferStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  progressIndicator,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  progressIndicator?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {progressIndicator}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Offre supplémentaire
        </h2>
        <p className="text-gray-600">Proposez-vous des services à domicile ?</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => updateFormData({ extraOffer: "yes" })}
          className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
            formData.extraOffer === "yes"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Oui</h3>
              <p className="text-sm text-gray-600">
                Je propose des services à domicile
              </p>
            </div>
            {formData.extraOffer === "yes" && (
              <Check className="w-5 h-5 text-primary" />
            )}
          </div>
        </button>

        <button
          onClick={() => updateFormData({ extraOffer: "no" })}
          className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
            formData.extraOffer === "no"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Non</h3>
              <p className="text-sm text-gray-600">
                Je propose uniquement des services en salon
              </p>
            </div>
            {formData.extraOffer === "no" && (
              <Check className="w-5 h-5 text-primary" />
            )}
          </div>
        </button>
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continuer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour l'étape adresse du salon
function SalonAddressStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  progressIndicator,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  progressIndicator?: React.ReactNode;
}) {
  const handleValidate = () => {
    if (!formData.salonAddress?.street?.trim()) {
      alert("L'adresse est requise");
      return;
    }
    if (!formData.salonAddress?.city?.trim()) {
      alert("La ville est requise");
      return;
    }
    if (!formData.salonAddress?.postalCode?.trim()) {
      alert("Le code postal est requis");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {progressIndicator}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Adresse du salon
        </h2>
        <p className="text-gray-600">Où se trouve votre salon ?</p>
      </div>

      <div className="space-y-4">
        <GoogleAddressAutocomplete
          id="address"
          label="Adresse complète *"
          placeholder="Rechercher une adresse..."
          value={
            formData.salonAddress?.formattedAddress ||
            formData.salonAddress?.street ||
            ""
          }
          onAddressSelect={(addressData: AddressData) => {
            updateFormData({
              salonAddress: {
                street: addressData.street,
                city: addressData.city,
                postalCode: addressData.postalCode,
                country: addressData.country,
                apartment:
                  addressData.apartment ||
                  formData.salonAddress?.apartment ||
                  "",
                latitude: addressData.latitude,
                longitude: addressData.longitude,
                formattedAddress: addressData.formattedAddress,
              } as FormData["salonAddress"],
            });
          }}
          required
        />

        <div>
          <Label htmlFor="apartment">Appartement / Suite (optionnel)</Label>
          <Input
            id="apartment"
            placeholder="Apt 4B"
            value={formData.salonAddress?.apartment || ""}
            onChange={(e) =>
              updateFormData({
                salonAddress: {
                  ...formData.salonAddress,
                  apartment: e.target.value,
                  street: formData.salonAddress?.street || "",
                  city: formData.salonAddress?.city || "",
                  postalCode: formData.salonAddress?.postalCode || "",
                  country: formData.salonAddress?.country || "Canada",
                } as FormData["salonAddress"],
              })
            }
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Ville *</Label>
            <Input
              id="city"
              placeholder="Montréal"
              value={formData.salonAddress?.city || ""}
              onChange={(e) =>
                updateFormData({
                  salonAddress: {
                    ...formData.salonAddress,
                    city: e.target.value,
                    street: formData.salonAddress?.street || "",
                    postalCode: formData.salonAddress?.postalCode || "",
                    country: formData.salonAddress?.country || "Canada",
                  } as FormData["salonAddress"],
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Code postal *</Label>
            <Input
              id="postalCode"
              placeholder="H1A 1A1"
              value={formData.salonAddress?.postalCode || ""}
              onChange={(e) =>
                updateFormData({
                  salonAddress: {
                    ...formData.salonAddress,
                    postalCode: e.target.value,
                    street: formData.salonAddress?.street || "",
                    city: formData.salonAddress?.city || "",
                    country: formData.salonAddress?.country || "Canada",
                  } as FormData["salonAddress"],
                })
              }
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="country">Pays *</Label>
          <select
            id="country"
            value={formData.salonAddress?.country || "Canada"}
            onChange={(e) =>
              updateFormData({
                salonAddress: {
                  ...formData.salonAddress,
                  country: e.target.value,
                  street: formData.salonAddress?.street || "",
                  city: formData.salonAddress?.city || "",
                  postalCode: formData.salonAddress?.postalCode || "",
                } as FormData["salonAddress"],
              })
            }
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="Canada">Canada</option>
            <option value="France">France</option>
            <option value="USA">USA</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button onClick={handleValidate} className="flex-1">
          Continuer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour l'étape nom du salon
function SalonNameStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  progressIndicator,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  progressIndicator?: React.ReactNode;
}) {
  const handleValidate = () => {
    if (!formData.salonName.trim()) {
      alert("Le nom du salon est requis");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {progressIndicator}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Nom de votre salon
        </h2>
        <p className="text-gray-600">
          Comment souhaitez-vous que votre salon soit appelé ?
        </p>
      </div>

      <div>
        <Label htmlFor="salonName">Nom du salon *</Label>
        <Input
          id="salonName"
          placeholder="Ex: Salon de Mélissa"
          value={formData.salonName}
          onChange={(e) => updateFormData({ salonName: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button
          onClick={handleValidate}
          className="flex-1"
          disabled={!formData.salonName.trim()}
        >
          Continuer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour l'étape description
function SalonDescriptionStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  progressIndicator,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  progressIndicator?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {progressIndicator}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Description de votre salon
        </h2>
        <p className="text-gray-600">Décrivez votre salon en quelques mots</p>
      </div>

      <div>
        <Label htmlFor="salonDescription">Description</Label>
        <Textarea
          id="salonDescription"
          placeholder="Salon de Mélissa est un salon de coiffure pour hommes et femmes..."
          value={formData.salonDescription}
          onChange={(e) => updateFormData({ salonDescription: e.target.value })}
          className="mt-1 min-h-[120px]"
          rows={5}
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.salonDescription.length} caractères
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continuer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour l'étape horaires
function SalonHoursStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  progressIndicator,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  progressIndicator?: React.ReactNode;
}) {
  const updateDayHours = (
    dayId: string,
    updates: Partial<FormData["salonHours"][0]>
  ) => {
    const updatedHours = formData.salonHours.map((day) =>
      day.id === dayId ? { ...day, ...updates } : day
    );
    updateFormData({ salonHours: updatedHours });
  };

  return (
    <div className="space-y-6">
      {progressIndicator}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Horaires d&apos;ouverture
        </h2>
        <p className="text-gray-600">
          Définissez les horaires d&apos;ouverture de votre salon
        </p>
      </div>

      <div className="space-y-4">
        {formData.salonHours.map((day) => (
          <div
            key={day.id}
            className="border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">{day.name}</Label>
              <Checkbox
                checked={day.enabled}
                onChange={(checked: boolean) =>
                  updateDayHours(day.id, { enabled: checked })
                }
              />
            </div>
            {day.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Ouverture</Label>
                  <Input
                    type="time"
                    value={day.openingTime}
                    onChange={(e) =>
                      updateDayHours(day.id, { openingTime: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Fermeture</Label>
                  <Input
                    type="time"
                    value={day.closingTime}
                    onChange={(e) =>
                      updateDayHours(day.id, { closingTime: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continuer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour l'étape images
function SalonImagesStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  progressIndicator,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  progressIndicator?: React.ReactNode;
}) {
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateFormData({ salonImages: [...formData.salonImages, ...files] });
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.salonImages.filter((_, i) => i !== index);
    updateFormData({ salonImages: updatedImages });
  };

  return (
    <div className="space-y-6">
      {progressIndicator}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Photos de votre salon
        </h2>
        <p className="text-gray-600">
          Ajoutez des photos pour présenter votre salon (optionnel)
        </p>
      </div>

      <div>
        <Label>Photos</Label>
        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">📷</span>
            </div>
            <span className="text-sm text-gray-600">
              Cliquez pour ajouter des photos
            </span>
            <span className="text-xs text-gray-500 mt-1">
              PNG, JPG jusqu&apos;à 10MB
            </span>
          </label>
        </div>

        {formData.salonImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.salonImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Salon ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continuer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour l'étape résumé
function SalonResumeStep({
  formData,
  onFinalSubmit,
  isSubmitting,
  submissionStep,
  onPrev,
  salonTypes,
  progressIndicator,
}: {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onFinalSubmit: () => void;
  isSubmitting: boolean;
  submissionStep: string;
  onPrev: () => void;
  salonTypes: any[];
  progressIndicator?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {progressIndicator}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Récapitulatif
        </h2>
        <p className="text-gray-600">
          Vérifiez vos informations avant de finaliser
        </p>
      </div>

      <div className="space-y-6 divide-y divide-gray-200">
        <div className="pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Informations personnelles
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Email:</span> {formData.email}
            </p>
            <p>
              <span className="text-gray-600">Nom:</span> {formData.lastName}
            </p>
            <p>
              <span className="text-gray-600">Prénom:</span>{" "}
              {formData.firstName}
            </p>
            <p>
              <span className="text-gray-600">Téléphone:</span>{" "}
              {formData.countryCode} {formData.phone}
            </p>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
          <div className="flex flex-wrap gap-2">
            {formData.services.map((serviceId) => {
              const service = salonTypes.find((s: any) => s.id === serviceId);
              return (
                <span
                  key={serviceId}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {service?.name || serviceId}
                </span>
              );
            })}
          </div>
        </div>

        <div className="pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Salon</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Nom:</span> {formData.salonName}
            </p>
            {formData.salonDescription && (
              <p>
                <span className="text-gray-600">Description:</span>{" "}
                {formData.salonDescription}
              </p>
            )}
            {formData.salonAddress && (
              <p>
                <span className="text-gray-600">Adresse:</span>{" "}
                {formData.salonAddress.street}, {formData.salonAddress.city},{" "}
                {formData.salonAddress.postalCode}
              </p>
            )}
            <p>
              <span className="text-gray-600">Services à domicile:</span>{" "}
              {formData.extraOffer === "yes" ? "Oui" : "Non"}
            </p>
          </div>
        </div>

        {formData.salonImages.length > 0 && (
          <div className="pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Photos</h3>
            <p className="text-sm text-gray-600">
              {formData.salonImages.length} photo(s) ajoutée(s)
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex-1"
          disabled={isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button
          onClick={onFinalSubmit}
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {submissionStep || "Création..."}
            </>
          ) : (
            <>
              Créer mon salon
              <Check className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
