"use client";

import { GoogleAddressAutocomplete } from "@/components/ui/GoogleAddressAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  salonName: string;
  salonDescription?: string;
  services: string[];
  extraOffer: "yes" | "no";
  salonImages: File[];
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

interface AddressData {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  apartment?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
}

interface SalonInfoStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  salonTypes: any[];
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

export function SalonInfoStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  salonTypes,
  isLoading,
  currentStep,
  totalSteps,
}: SalonInfoStepProps) {
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateFormData({ salonImages: [...formData.salonImages, ...files] });
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.salonImages.filter((_, i) => i !== index);
    updateFormData({ salonImages: updatedImages });
  };

  const handleValidate = () => {
    if (!formData.salonName?.trim()) {
      alert("Veuillez indiquer le nom de votre salon");
      return;
    }
    if (formData.services.length === 0) {
      alert("Veuillez sélectionner au moins un service");
      return;
    }
    if (!formData.salonAddress || !formData.salonAddress.street?.trim()) {
      alert("L'adresse est requise");
      return;
    }
    if (!formData.salonAddress.city?.trim()) {
      alert("La ville est requise");
      return;
    }
    if (!formData.salonAddress.postalCode?.trim()) {
      alert("Le code postal est requis");
      return;
    }
    if (!formData.extraOffer) {
      alert("Veuillez indiquer si vous proposez des services à domicile");
      return;
    }
    if (formData.salonImages.length === 0) {
      alert("Veuillez ajouter au moins une photo de votre salon");
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
    <div className="space-y-8">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Informations du salon"
      />

      {/* Nom du salon - requis */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Nom de votre salon
          </h2>
          <p className="text-gray-600">
            Comment souhaitez-vous que votre établissement soit affiché ?
          </p>
        </div>
        <div>
          <Label htmlFor="salonName">Nom du salon *</Label>
          <Input
            id="salonName"
            type="text"
            placeholder="Ex. Salon Élégance, Coiffure Marie..."
            value={formData.salonName ?? ""}
            onChange={(e) => updateFormData({ salonName: e.target.value })}
            className="mt-1"
            required
          />
        </div>
      </div>

      {/* Section Services */}
      <div className="space-y-4">
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
              type="button"
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
                    <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                  )}
                </div>
                {formData.services.includes(service.id) && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Adresse */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Adresse du salon
          </h2>
          <p className="text-gray-600">Où se trouve votre salon ?</p>
        </div>

        <GoogleAddressAutocomplete
          id="address"
          label="Adresse complète"
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

        {formData.salonAddress?.street &&
          formData.salonAddress?.city &&
          formData.salonAddress?.postalCode && (
            <>
              <div>
                <Label htmlFor="apartment">
                  Appartement / Suite (optionnel)
                </Label>
                <Input
                  id="apartment"
                  placeholder="Apt 4B"
                  value={formData.salonAddress?.apartment || ""}
                  onChange={(e) =>
                    updateFormData({
                      salonAddress: {
                        ...formData.salonAddress!,
                        apartment: e.target.value,
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
                          ...formData.salonAddress!,
                          city: e.target.value,
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
                          ...formData.salonAddress!,
                          postalCode: e.target.value,
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
                        ...formData.salonAddress!,
                        country: e.target.value,
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
            </>
          )}
      </div>

      {/* Section Offre supplémentaire */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Offre supplémentaire
          </h2>
          <p className="text-gray-600">
            Proposez-vous des services à domicile ?
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
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
            type="button"
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
      </div>

      {/* Upload des images - juste après offre supplémentaire */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Photos de votre salon
          </h2>
          <p className="text-gray-600">
            Ajoutez au moins une photo pour présenter votre salon
          </p>
        </div>

        <div>
          <Label>Photos *</Label>
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
                    type="button"
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
          disabled={
            !formData.salonName?.trim() ||
            formData.services.length === 0 ||
            !formData.salonAddress ||
            !formData.extraOffer ||
            formData.salonImages.length === 0
          }
        >
          Continuer
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
