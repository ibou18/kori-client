import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, X } from "lucide-react";
import Image from "next/image";

export default function AddPicturesPackage({
  packages,
  setPackages,
  createdPackageIds,
  setCurrentStep,
  handleAddImagesToPackages,
  uploadingImages,
}: {
  packages: any[];
  setPackages: React.Dispatch<React.SetStateAction<any[]>>;
  createdPackageIds: string[];
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  handleAddImagesToPackages: any;
  uploadingImages: boolean;
}) {
  const [imageUrls, setImageUrls] = useState<Record<number, string[]>>({});

  // Convertir les objets File en URLs pour l'aperçu
  useEffect(() => {
    const urls: Record<number, string[]> = {};

    packages.forEach((pkg, index) => {
      if (pkg.images && pkg.images.length) {
        urls[index] = Array.from(pkg.images).map((file: any) =>
          typeof file === "string" ? file : URL.createObjectURL(file)
        );
      }
    });

    setImageUrls(urls);

    // Nettoyage des URLs à la destruction du composant
    return () => {
      Object.values(urls).forEach((urlArray) => {
        urlArray.forEach((url) => {
          if (!url.startsWith("data:") && !url.startsWith("http")) {
            URL.revokeObjectURL(url);
          }
        });
      });
    };
  }, [packages]);

  // Supprimer une image
  const removeImage = (packageIndex: number, imageIndex: number) => {
    const newPackages = [...packages];
    const newImages = Array.from(newPackages[packageIndex]?.images || []);
    newImages.splice(imageIndex, 1);
    newPackages[packageIndex] = {
      ...newPackages[packageIndex],
      images: newImages,
    };
    setPackages(newPackages);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Étape 3: Ajouter les images aux colis
      </h2>

      {/* Liste des colis pour ajouter les images */}
      <div className="space-y-6 mb-6">
        {createdPackageIds.map((packageId, index) => {
          const pkg = packages[index] || {};
          const hasExistingImages = pkg.images && pkg.images.length > 0;
          console.log("pkg", pkg);

          return (
            <div
              key={packageId}
              className="p-6 border rounded-md bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-lg">
                  {pkg.description || `Colis ${index + 1}`}
                </h3>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Dimensions: </span>
                  <span className="text-sm text-muted-foreground">
                    {pkg.size}, {pkg.weight} kg
                  </span>
                </div>
              </div>

              {/* Prévisualisation des images déjà sélectionnées */}
              {hasExistingImages && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">
                    Images déjà sélectionnées:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {imageUrls[index]?.map((url, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative rounded-md overflow-hidden border h-40"
                      >
                        <div className="absolute top-0 right-0 z-10 m-1">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-6 w-6 rounded-full"
                            onClick={() => removeImage(index, imgIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="h-full w-full relative">
                          <img
                            src={url}
                            alt={`Aperçu ${imgIndex + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Option d'ajout d'images supplémentaires */}
              <div className="mt-4">
                <Label htmlFor={`images-${packageId}`} className="block mb-2">
                  {hasExistingImages
                    ? "Ajouter d'autres photos"
                    : "Ajouter des photos du colis"}
                </Label>
                <Input
                  id={`images-${packageId}`}
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-1"
                  onChange={(e) => {
                    if (e.target.files) {
                      const newPackages = [...packages];
                      const existingImages = newPackages[index]?.images || [];

                      newPackages[index] = {
                        ...newPackages[index],
                        images: [
                          ...existingImages,
                          ...Array.from(e.target.files),
                        ],
                      };
                      setPackages(newPackages);
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
        >
          Retour
        </Button>
        <Button onClick={handleAddImagesToPackages} disabled={uploadingImages}>
          {uploadingImages ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi des images...
            </>
          ) : (
            "Finaliser la livraison"
          )}
        </Button>
      </div>
    </div>
  );
}
