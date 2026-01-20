"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  salonName: string;
}

interface SalonNameStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SalonNameStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  currentStep,
  totalSteps,
}: SalonNameStepProps) {
  const handleValidate = () => {
    if (!formData.salonName.trim()) {
      alert("Le nom du salon est requis");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Nom du salon"
      />
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

