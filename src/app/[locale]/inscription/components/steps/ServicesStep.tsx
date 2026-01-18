"use client";

import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  services: string[];
}

interface ServicesStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  salonTypes: any[];
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

export function ServicesStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  salonTypes,
  isLoading,
  currentStep,
  totalSteps,
}: ServicesStepProps) {
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
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Services"
      />
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

