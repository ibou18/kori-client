"use client";
import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { PACKAGE_CATEGORIES, PACKAGE_SIZES } from "@/shared/constantes";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";

interface PackageFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (data: any) => void;
  packageData: any;
  handleChangePackage: any;
  handleRemoveImage: (index: number) => void;
  setPackages: (packages: any) => void;
}

const PackageForm: React.FC<PackageFormProps> = ({
  open,
  setOpen,
  packageData,
  onSubmit,
  handleChangePackage,
  handleRemoveImage,
  setPackages,
}) => {
  // État local pour suivre les modifications du colis actuel
  const [localPackage, setLocalPackage] = useState({ ...packageData });

  console.log("localPackage", localPackage);

  // Mettre à jour l'état local quand packageData change
  useEffect(() => {
    setLocalPackage({ ...packageData });
  }, [packageData]);

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (field: string, value: any) => {
    setLocalPackage((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    onSubmit(localPackage);
    setOpen(false);
  };

  // Gérer l'upload d'images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);

      // Vérifier si images est défini et est un tableau
      const currentImages = localPackage.images || [];

      setLocalPackage((prev: any) => ({
        ...prev,
        images: [...currentImages, ...fileArray],
      }));
    }
  };

  // Gérer la suppression d'une image
  const handleImageRemove = (indexToRemove: number) => {
    setLocalPackage((prev: any) => ({
      ...prev,
      images: (prev.images || []).filter(
        (_: any, idx: number) => idx !== indexToRemove
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un colis</DialogTitle>
          <DialogDescription>
            Créez un nouveau colis pour cette livraison.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Images */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="packageImage" className="text-right pt-2">
              Images
            </Label>
            <div className="col-span-3 space-y-4">
              <Input
                id="packageImage"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-3"
              />

              {/* Aperçu des images */}
              {localPackage.images && localPackage.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {localPackage.images.map((image: File, index: number) => (
                    <div key={index} className="relative group">
                      <div className="h-24 w-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        <Image
                          width={96}
                          height={96}
                          src={
                            typeof image === "string"
                              ? image
                              : URL.createObjectURL(image)
                          }
                          alt={`Image ${index + 1}`}
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute top-0 right-0 p-1 bg-gray-200 text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleImageRemove(index)}
                      >
                        <span className="sr-only">Supprimer</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={localPackage.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="col-span-3"
              placeholder="Description du colis"
            />
          </div>
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">
              Poids (kg)
            </Label>
            <Input
              type="number"
              id="weight"
              value={localPackage.weight || ""} // Change initial value to ""
              onChange={(e) =>
                handleInputChange("weight", parseFloat(e.target.value) || 0)
              }
              className="col-span-3"
              step="0.1"
              min="0"
              placeholder="0.0"
            />
          </div> */}

          {/* D'abord la sélection de taille */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="size" className="text-right">
              Taille
            </Label>
            <Select
              value={localPackage.size || "SMALL"}
              onValueChange={(value) => {
                // Trouver la plage de poids pour la taille sélectionnée
                const selectedSize = PACKAGE_SIZES.find(
                  (s) => s.value === value
                );

                if (selectedSize) {
                  // Ajuster le poids si nécessaire pour être dans la plage
                  const currentWeight = localPackage.weight || 0;
                  let newWeight = currentWeight;

                  // Si le poids est hors limite, utiliser la valeur moyenne de la plage
                  if (
                    currentWeight < selectedSize.minWeight ||
                    currentWeight > selectedSize.maxWeight
                  ) {
                    newWeight =
                      (selectedSize.minWeight + selectedSize.maxWeight) / 2;
                  }

                  // Mettre à jour à la fois la taille et le poids
                  setLocalPackage((prev: any) => ({
                    ...prev,
                    size: value,
                    weight: parseFloat(newWeight.toFixed(1)),
                  }));
                } else {
                  // Juste mettre à jour la taille si aucune plage n'est trouvée
                  handleInputChange("size", value);
                }
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner une taille" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label} - {size.volume} ({size.minWeight}-
                    {size.maxWeight} kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ensuite le slider de poids, avec plage dynamique */}
          {localPackage.size && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Poids estimé (kg)
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">
                    {localPackage.weight || 0} kg
                  </span>
                  <Input
                    type="text"
                    id="weight-input"
                    value={
                      localPackage.weight === 0
                        ? "0"
                        : localPackage.weight || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.,]/g, "");
                      const normalizedValue = value.replace(",", ".");

                      // Récupérer les limites pour la taille sélectionnée
                      const selectedSize = PACKAGE_SIZES.find(
                        (s) => s.value === localPackage.size
                      );
                      if (!selectedSize) return;

                      // Appliquer les limites
                      if (value === "" || normalizedValue === "0") {
                        handleInputChange("weight", selectedSize.minWeight);
                      } else if (!isNaN(parseFloat(normalizedValue))) {
                        const numValue = parseFloat(normalizedValue);
                        const limitedValue = Math.max(
                          selectedSize.minWeight,
                          Math.min(selectedSize.maxWeight, numValue)
                        );
                        handleInputChange("weight", limitedValue);
                      }
                    }}
                    className="w-20 h-8 text-center ml-2"
                  />
                </div>

                {(() => {
                  // Obtenir les bornes pour la taille sélectionnée
                  const selectedSize = PACKAGE_SIZES.find(
                    (s) => s.value === localPackage.size
                  );
                  if (!selectedSize) return null;

                  const { minWeight, maxWeight } = selectedSize;

                  // Calculer le pas du slider
                  const step = Math.max(0.1, (maxWeight - minWeight) / 20);

                  // Générer des étiquettes pour l'échelle
                  const generateLabels = () => {
                    const labels = [];
                    const steps = 5; // Nombre d'étapes à afficher
                    for (let i = 0; i <= steps; i++) {
                      const value =
                        minWeight + ((maxWeight - minWeight) / steps) * i;
                      labels.push(value.toFixed(1));
                    }
                    return labels;
                  };

                  const labels = generateLabels();

                  return (
                    <>
                      <Slider
                        className="h-[10px] bg-orange-200 rounded-md"
                        min={minWeight}
                        max={maxWeight}
                        step={step}
                        value={[localPackage.weight || minWeight]}
                        onValueChange={(values) =>
                          handleInputChange("weight", values[0])
                        }
                      />

                      <div className="flex justify-between text-xs text-gray-500">
                        {labels.map((label, index) => (
                          <span key={index}>{label} kg</span>
                        ))}
                      </div>

                      <div className="flex justify-between text-xs bg-blue-50 p-2 rounded-md">
                        <span className="text-blue-700">
                          {
                            PACKAGE_SIZES.find(
                              (s) => s.value === localPackage.size
                            )?.description
                          }
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Catégorie */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Catégorie
            </Label>
            <Select
              value={localPackage.category || "OTHER"}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fragile */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fragile" className="text-right">
              Fragile
            </Label>
            <div className="flex items-center col-span-3">
              <Switch
                id="fragile"
                checked={localPackage.fragile || false}
                onChange={(checked) => handleInputChange("fragile", checked)}
              />
              <span className="ml-2">
                {localPackage.fragile ? "Oui" : "Non"}
              </span>
            </div>
          </div>

          {/* Instructions spéciales */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="specialInstructions" className="text-right">
              Instructions
            </Label>
            <Textarea
              id="specialInstructions"
              value={localPackage.specialInstructions || ""}
              onChange={(e) =>
                handleInputChange("specialInstructions", e.target.value)
              }
              className="col-span-3"
              placeholder="Instructions spéciales pour la livraison"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Ajouter le colis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PackageForm;
