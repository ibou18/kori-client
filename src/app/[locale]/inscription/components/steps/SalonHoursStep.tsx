"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  salonHours: {
    id: string;
    name: string;
    enabled: boolean;
    openingTime: string;
    closingTime: string;
  }[];
}

interface SalonHoursStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SalonHoursStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  currentStep,
  totalSteps,
}: SalonHoursStepProps) {
  const updateDayHours = (
    dayId: string,
    updates: Partial<FormData["salonHours"][0]>,
  ) => {
    const updatedHours = formData.salonHours.map((day) =>
      day.id === dayId ? { ...day, ...updates } : day,
    );
    updateFormData({ salonHours: updatedHours });
  };

  return (
    <div className="space-y-6">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Horaires"
      />
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
