"use client";

import { Button } from "@/components/ui/button";
import {
  AddressData,
  GoogleAddressAutocomplete,
} from "@/components/ui/GoogleAddressAutocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
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

interface SalonAddressStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

export function SalonAddressStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  currentStep,
  totalSteps,
}: SalonAddressStepProps) {
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
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Adresse"
      />
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

