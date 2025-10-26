import { Button } from "@/components/ui/button";
import PackageForm from "./PackageForm";
import { PlusCircle } from "lucide-react";

export default function PackageSectionForm({
  packages,
  editPackage,
  removePackage,
  setCurrentPackageIndex,
  setOpenPackageModal,
  handleChangePackage,
  handleRemoveImage,
  openPackageModal,
  addPackage,
  setPackages,
  currentPackageIndex,
}: {
  packages: any[];
  editPackage: (index: number) => void;
  removePackage: (index: number) => void;
  setCurrentPackageIndex: (index: number) => void;
  setOpenPackageModal: (open: boolean) => void;
  handleChangePackage: any;
  handleRemoveImage: any;
  openPackageModal: boolean;
  addPackage: (pkg: any) => void;
  setPackages: (packages: any[]) => void;
  currentPackageIndex: number;
}) {
  return (
    <div className="mt-8 mb-6">
      <h3 className="text-lg font-semibold mb-4">Colis</h3>

      {/* Liste des packages existants */}
      {packages.length > 0 ? (
        <div className="space-y-2 mb-4 border rounded-md p-4">
          <h4 className="font-medium mb-2">
            Colis ajoutés ({packages.length})
          </h4>
          {packages.map((pkg, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-muted/50 p-2 rounded"
            >
              <div>
                <span className="font-medium">{pkg.description}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({pkg.weight}kg, {pkg.size}, {pkg.category})
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editPackage(index)}
                >
                  Modifier
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removePackage(index)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center p-4 border border-dashed rounded-md mb-4">
          Aucun colis ajouté. Veuillez ajouter au moins un colis.
        </div>
      )}

      {/* Bouton pour ajouter un colis */}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setCurrentPackageIndex(-1); // Mode création
          setOpenPackageModal(true);
        }}
        className="w-full"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Ajouter un colis
      </Button>

      {/* Modal de formulaire de colis */}
      <PackageForm
        open={openPackageModal}
        setOpen={setOpenPackageModal}
        packageData={
          currentPackageIndex >= 0
            ? packages[currentPackageIndex]
            : {
                description: "",
                images: [],
                weight: 0,
                category: "OTHER",
                fragile: false,
                size: "SMALL",
                specialInstructions: "",
              }
        }
        handleChangePackage={handleChangePackage}
        handleRemoveImage={handleRemoveImage}
        setPackages={setPackages}
        onSubmit={addPackage}
      />
    </div>
  );
}
