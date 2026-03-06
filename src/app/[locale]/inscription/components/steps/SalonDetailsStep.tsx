"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  salonName: string;
  salonDescription: string;
  salonHours: {
    id: string;
    name: string;
    enabled: boolean;
    openingTime: string;
    closingTime: string;
  }[];
}

interface SalonDetailsStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SalonDetailsStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  currentStep,
  totalSteps,
}: SalonDetailsStepProps) {
  const updateDayHours = (
    dayId: string,
    updates: Partial<FormData["salonHours"][0]>,
  ) => {
    const updatedHours = formData.salonHours.map((day) =>
      day.id === dayId ? { ...day, ...updates } : day,
    );
    updateFormData({ salonHours: updatedHours });
  };

  const handleValidate = () => {
    if (!formData.salonName.trim()) {
      alert("Le nom du salon est requis");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Détails du salon"
      />

      {/* Section Nom du salon */}
      <div className="space-y-4">
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
      </div>

      {/* Section Description */}
      <div className="space-y-4 border-t pt-6">
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
      </div>

      {/* Section Horaires */}
      <div className="space-y-4 border-t pt-6">
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
              className="border border-gray-200 rounded-lg py-4 px-10 space-y-3"
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
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Ouverture</Label>
                    <Input
                      type="time"
                      value={day.openingTime}
                      onChange={(e) =>
                        updateDayHours(day.id, { openingTime: e.target.value })
                      }
                      className="mt-1"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Fermeture</Label>
                    <Input
                      type="time"
                      value={day.closingTime}
                      onChange={(e) =>
                        updateDayHours(day.id, { closingTime: e.target.value })
                      }
                      className="mt-1"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex gap-4 pt-6 border-t">
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
