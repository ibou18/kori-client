"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  salonImages: File[];
}

interface SalonImagesStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SalonImagesStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  currentStep,
  totalSteps,
}: SalonImagesStepProps) {
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
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Images"
      />
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
                    alt={`Photo du salon ${index + 1}`}
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
