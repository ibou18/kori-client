"use client";

import { Button } from "@/components/ui/button";
import { Check, ChevronLeft } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  email: string;
  lastName: string;
  firstName: string;
  phone: string;
  countryCode: string;
  services: string[];
  salonName: string;
  salonDescription: string;
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
  extraOffer: "yes" | "no";
  salonImages: File[];
}

interface SalonResumeStepProps {
  formData: FormData;
  onFinalSubmit: () => void;
  isSubmitting: boolean;
  submissionStep: string;
  onPrev: () => void;
  salonTypes: any[];
  currentStep: number;
  totalSteps: number;
}

export function SalonResumeStep({
  formData,
  onFinalSubmit,
  isSubmitting,
  submissionStep,
  onPrev,
  salonTypes,
  currentStep,
  totalSteps,
}: SalonResumeStepProps) {
  return (
    <div className="space-y-6">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Résumé"
      />
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

