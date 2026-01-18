"use client";

import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  extraOffer: "yes" | "no";
}

interface ExtraOfferStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function ExtraOfferStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  currentStep,
  totalSteps,
}: ExtraOfferStepProps) {
  return (
    <div className="space-y-6">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Offre supplémentaire"
      />
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

