"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  salonDescription: string;
}

interface SalonDescriptionStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SalonDescriptionStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  currentStep,
  totalSteps,
}: SalonDescriptionStepProps) {
  return (
    <div className="space-y-6">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Description"
      />
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

