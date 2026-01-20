"use client";

import { useGetSalonTypes } from "@/app/data/hooks";
import { createProspectApi } from "@/app/data/services";
import appStoreBadge from "@/assets/appstore.png";
import googlePlayBadge from "@/assets/googleplay.png";
import icon from "@/assets/icon.png";
import logo from "@/assets/logo-black.png";
import { Button } from "@/components/ui/button";
import { FormattedPhoneInput } from "@/components/ui/FormattedPhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

// Types de services disponibles
const SERVICE_TYPES = [
  { id: "HAIRDRESSER", label: "Coiffure", icon: "💇" },
  { id: "BARBER", label: "Barbier", icon: "💈" },
  { id: "NAIL_SALON", label: "Manucure", icon: "💅" },
  { id: "MAQUILLAGE", label: "Maquillage", icon: "💄" },
  { id: "CILS", label: "Cils & Sourcils", icon: "👁️" },
  { id: "BODY_CARE", label: "Soins du corps", icon: "🧖" },
];

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  services: string[];
}
const devMode = process.env.NODE_ENV === "development";

export function QuickRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: salonTypesResponse, isLoading: isLoadingSalonTypes } =
    useGetSalonTypes();

  // Extraire les types de salon de la réponse API
  const salonTypes = salonTypesResponse?.data?.salonTypes || [];

  const [formData, setFormData] = useState<FormData>({
    email: devMode ? "test@test.com" : "",
    firstName: devMode ? "Test" : "",
    lastName: devMode ? "Test" : "",
    phone: devMode ? "2345678901" : "",
    countryCode: "+1",
    services: devMode ? [
      "HAIRDRESSER",
      "BARBER",
      "NAIL_SALON",
    ] : [],
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleService = (serviceId: string) => {
    const newServices = formData.services.includes(serviceId)
      ? formData.services.filter((s) => s !== serviceId)
      : [...formData.services, serviceId];
    updateField("services", newServices);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Email invalide" as any;
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Prénom requis" as any;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Nom requis" as any;
    }
    if (!formData.phone || formData.phone.length < 8) {
      newErrors.phone = "Numéro de téléphone invalide" as any;
    }
    if (formData.services.length === 0) {
      newErrors.services = "Sélectionnez au moins un service" as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs", {
        description: "Certains champs sont invalides ou manquants.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createProspectApi({
        email: formData.email.toLowerCase().trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.countryCode + formData.phone,
        indicatif: formData.countryCode,
        services: formData.services,
        source: "landing_page",
      });

      if (response?.success) {
        setIsSuccess(true);
        toast.success("Inscription réussie !", {
          description: "Nous vous contacterons très bientôt.",
        });
      } else {
        throw new Error(response?.message || "Erreur lors de l'inscription");
      }
    } catch (error: any) {
      console.error("❌ Erreur inscription:", error);
      toast.error("Erreur lors de l'inscription", {
        description: getErrorMessage(error),
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorMessage = (error: any): string => {
    const errorCode = error?.response?.data?.errorCode || error?.errorCode;

    const errorMessages: Record<string, string> = {
      EMAIL_ALREADY_EXISTS:
        "Cette adresse email est déjà enregistrée. Nous vous contacterons bientôt !",
      VALIDATION_ERROR: "Veuillez vérifier les informations saisies.",
      NETWORK_ERROR: "Problème de connexion. Vérifiez votre connexion internet.",
    };

    if (errorCode && errorMessages[errorCode]) {
      return errorMessages[errorCode];
    }

    return (
      error?.response?.data?.message ||
      error?.message ||
      "Une erreur est survenue. Veuillez réessayer."
    );
  };

  // Écran de succès
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FEFCF9] via-white to-[#F5F5F5]">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Merci pour votre inscription !
            </h1>
            <p className="text-gray-600 mb-6">
              Nous avons bien reçu vos informations. Un membre de notre équipe
              vous contactera dans les plus brefs délais pour vous accompagner
              dans la création de votre espace korí.
            </p>

            <div className="bg-primary/5 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Email :</strong> {formData.email}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Téléphone :</strong> {formData.countryCode}
                {formData.phone}
              </p>
            </div>

            {/* Liens de téléchargement des applications */}
            <div className="mb-6">
              <p className="text-gray-700 text-sm mb-4">
                En attendant, téléchargez l&apos;application mobile korí pour découvrir notre plateforme :
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://apps.apple.com/app/kori/id6754260244"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <Image
                    src={appStoreBadge}
                    alt="Télécharger sur l'App Store"
                    width={160}
                    height={48}
                    className="h-12 w-auto"
                  />
                </a>

                <a
                  href="https://play.google.com/store/apps/details?id=com.laguidev.kori"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <Image
                    src={googlePlayBadge}
                    alt="Disponible sur Google Play"
                    width={160}
                    height={48}
                    className="h-12 w-auto"
                  />
                </a>
              </div>
            </div>

            <Link href="/">
              <Button variant="outline" className="w-full">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FEFCF9] via-white to-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
          {/* Icône Kori animée */}
          <motion.div
            className="flex-shrink-0 hidden lg:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              animate={{
                rotate: [-0.5, 0.5, -0.5, 0.5, -0.3, 0.3, 0],
                scale: [1, 1.03, 1],
              }}
              transition={{
                rotate: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              }}
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
              className="text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Rejoignez la communauté{" "}
              <span className="text-primary">korí</span>
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

      {/* Formulaire */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Inscription rapide
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Votre prénom"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={cn(errors.firstName && "border-red-500")}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Votre nom"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={cn(errors.lastName && "border-red-500")}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <FormattedPhoneInput
              value={formData.phone}
              countryCode={formData.countryCode}
              onPhoneChange={(phone: string) => updateField("phone", phone)}
              onCountryCodeChange={(dialCode: string) =>
                updateField("countryCode", dialCode)
              }
              error={errors.phone as string | undefined}
              label="Téléphone"
              required
            />

            {/* Services */}
            <div>
              <Label>Quelle prestation voulez-vous offrir ? *</Label>
              <p className="text-sm text-gray-500 mb-3">
                Vous pouvez choisir une ou plusieurs prestations
              </p>

              {isLoadingSalonTypes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-3 text-sm text-gray-500">Chargement des services...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(salonTypes.length > 0 ? salonTypes : SERVICE_TYPES).map((service: any) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left",
                        formData.services.includes(service.id)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {service.name || service.label}
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
              )}

              {errors.services && (
                <p className="text-red-500 text-sm mt-2">{errors.services}</p>
              )}
            </div>

            {/* Bouton de soumission */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                "S'inscrire gratuitement"
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              En vous inscrivant, vous acceptez nos{" "}
              <Link href="/terms/cgu-pro" className="text-primary hover:underline">
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
          </form>
        </motion.div>
      </main>

      {/* Témoignages */}
      <TestimonialsCarousel />

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} korí. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
