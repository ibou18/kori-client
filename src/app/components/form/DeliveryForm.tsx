"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Loader2, ArrowRight, ImageDown, Package } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useGetUsers,
  useGetTrips,
  useUpdateDelivery,
  useGetReceivers,
  useCreateReceiver,
  useGetUser,
  useGetDeliveryById,
} from "@/app/data/hooksHop";
// Nouveaux hooks pour le flux multi-étapes
import {
  useEstimatePackage,
  useCreateDeliveryWithPackages,
  useAddPackageImages,
} from "@/app/data/hooksHop"; // À créer

import { DeliveryStatus, ITrip } from "@/app/interfaceHop";
import { useSession } from "next-auth/react";

import { toast } from "sonner";
import PackageSectionForm from "./PackageSectionForm";
import { useSearchParams } from "next/navigation";

import DeliveryCreate from "./deliveryComponents/DeliveryCreate";
import AddPicturesPackage from "./deliveryComponents/AddPicturesPackage";

interface DeliveryFormProps {
  mode?: "create" | "edit";
  delivery?: any;
  isLoading?: boolean;
  trip?: any;
  user?: any;
  receiver?: string;
  setOpenModal?: any;
}

export function DeliveryForm({
  mode = "create",
  trip,
  delivery,
  isLoading,
  user,
  setOpenModal,
}: DeliveryFormProps) {
  const router = useRouter();
  const { data: session }: any = useSession();

  const { data: userFromdb, isLoading: loadingUser } = useGetUser(
    session?.user.id
  );

  // États pour gérer les étapes
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Créer les colis avec estimation",
    "Créer la livraison",
    "Ajouter les images",
  ];

  const [openReceiverDialog, setOpenReceiverDialog] = useState(false);
  const [isAddingReceiver, setIsAddingReceiver] = useState<any>(false);
  const [newReceiverData, setNewReceiverData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // États
  const [openPackageModal, setOpenPackageModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [estimatedPackages, setEstimatedPackages] = useState<any[]>([]); // Les colis avec estimation de prix
  const [currentPackageIndex, setCurrentPackageIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [createdDeliveryId, setCreatedDeliveryId] = useState<
    string | undefined
  >(undefined);
  const [createdPackageIds, setCreatedPackageIds] = useState<string[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [priceAdjustment, setPriceAdjustment] = useState(0);

  // État du formulaire
  const [formData, setFormData] = useState({
    senderId: session.user?.id || "",
    receiverId: "",
    tripId: trip?.id || "",
    status: "PENDING" as DeliveryStatus,

    pickupAddressNumber: userFromdb?.addressNumber || 0,
    pickupAddress: userFromdb?.address || "",
    pickupCity: userFromdb?.city || "",
    pickupPostalCode: userFromdb?.postalCode || "",
    pickupCountry: userFromdb?.country || "",
    pickupAddressComplement: userFromdb?.addressComplement || "",

    deliveryAddressNumber: 0,
    deliveryAddress: "",
    deliveryCity: "",
    deliveryPostalCode: "",
    deliveryCountry: "",
    deliveryAddressComplement: "",

    pickupInstructions: "",
    deliveryInstructions: "",
    trackingNumber: `HOP${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`,
    actualPrice: 0,
    qrCodeUrl: "",
    estimatedPrice: 0,
  });

  // Récupération des données
  const { data: receivers, isLoading: loadingReceivers } = useGetReceivers();
  const { data: users = [], isLoading: loadingUsers } = useGetUsers();
  const { data: trips = [], isLoading: loadingTrips } = useGetTrips();

  const [retriveTrip, setRetriveTrip] = useState<any>(null);
  const searchParams = useSearchParams();
  const queryTripId = searchParams.get("tripId");

  // Nouveaux hooks pour le flux multi-étapes
  const { mutateAsync: estimatePackage } = useEstimatePackage();
  const { mutateAsync: createDeliveryWithPackages } =
    useCreateDeliveryWithPackages();
  const { mutateAsync: addPackageImages } = useAddPackageImages();
  const { mutateAsync: createReceiver } = useCreateReceiver();
  const { mutate: updateDelivery } = useUpdateDelivery();

  useEffect(() => {
    if (queryTripId && !formData.tripId) {
      setFormData((prev) => ({ ...prev, tripId: queryTripId }));
    }

    const temp = trips?.trips?.find((trip: ITrip) => trip.id === queryTripId);
    setRetriveTrip(temp);
  }, [queryTripId, trips]);

  // Pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (mode === "edit" && delivery && !isLoading) {
      setFormData({
        senderId: delivery.senderId,
        receiverId: delivery.receiverId,
        tripId: delivery.tripId || "",
        status: delivery.status,

        pickupAddressNumber: Number(delivery.pickupAddressNumber) || 0,
        pickupAddress: delivery.pickupAddress || "",
        pickupCity: delivery.pickupCity || "",
        pickupPostalCode: delivery.pickupPostalCode || "",
        pickupCountry: delivery.pickupCountry || "",
        pickupAddressComplement: delivery.pickupAddressComplement || "",

        deliveryAddressNumber: Number(delivery.deliveryAddressNumber) || 0,
        deliveryAddress: delivery.deliveryAddress || "",
        deliveryCity: delivery.deliveryCity || "",
        deliveryPostalCode: delivery.deliveryPostalCode || "",
        deliveryCountry: delivery.deliveryCountry || "",
        deliveryAddressComplement: delivery.deliveryAddressComplement || "",

        pickupInstructions: delivery.pickupInstructions || "",
        deliveryInstructions: delivery.deliveryInstructions || "",
        trackingNumber: delivery.trackingNumber,
        qrCodeUrl: delivery.qrCodeUrl || "",
        estimatedPrice: delivery.estimatedPrice,
        actualPrice: delivery.actualPrice || 0,
      });

      // Récupérer les packages si disponibles
      if (delivery.packages && delivery.packages.length > 0) {
        setPackages(delivery.packages);
      }
    } else if (trip) {
      setFormData((prev) => ({ ...prev, tripId: trip.id }));
    }
  }, [mode, delivery, isLoading, trip]);

  // Fonction pour gérer les changements dans les champs
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Fonctions pour la gestion des packages
  const addPackage = (newPackage: any) => {
    if (currentPackageIndex >= 0) {
      // Mode édition - mettre à jour un package existant
      setPackages((prev) =>
        prev.map((pkg, idx) => (idx === currentPackageIndex ? newPackage : pkg))
      );
    } else {
      // Mode création - ajouter un nouveau package
      setPackages((prev) => [...prev, newPackage]);
    }
    setOpenPackageModal(false);
    setCurrentPackageIndex(-1);
  };

  const editPackage = (index: number) => {
    setCurrentPackageIndex(index);
    setOpenPackageModal(true);
  };

  const removePackage = (index: number) => {
    setPackages((prev) => prev.filter((_, idx) => idx !== index));
  };
  console.log("retriveTrip", retriveTrip);
  // ÉTAPE 1: Estimer les colis
  const handleEstimatePackages = async () => {
    if (packages.length === 0) {
      toast.error("Veuillez ajouter au moins un colis");
      return;
    }

    setLoading(true);
    const estimatedResults: any[] = [];

    try {
      // Estimer chaque package individuellement
      for (const pkg of packages) {
        const response = await estimatePackage({
          weight: pkg.weight,
          width: pkg.width,
          height: pkg.height,
          depth: pkg.depth,
          description: pkg.description,
          fragile: pkg.fragile,
          category: pkg.category,
          size: pkg.size,
        });

        console.log("Réponse de l'API d'estimation:", response);

        // Vérifier la structure de la réponse
        const estimatedPrice =
          response.data?.package?.estimatedPrice ||
          response?.estimatedPrice ||
          response?.package?.estimatedPrice ||
          0;

        const packageId =
          response.data?.package?.id ||
          response?.id ||
          response?.package?.id ||
          null;

        if (!packageId) {
          console.error("ID de package manquant dans la réponse", response);
        }

        estimatedResults.push({
          ...pkg,
          estimatedPrice: estimatedPrice,
          packageId: packageId,
        });
      }

      // Une fois tous les packages estimés, mettre à jour l'état
      setEstimatedPackages(estimatedResults);

      // Calculer le prix total estimé
      const totalEstimatedPrice = estimatedResults.reduce(
        (sum, pkg) => sum + (pkg.estimatedPrice || 0),
        0
      );

      console.log("Prix total estimé:", totalEstimatedPrice);

      // Mettre à jour les données du formulaire avec le prix estimé
      setFormData((prev) => {
        const updated = {
          ...prev,
          estimatedPrice: totalEstimatedPrice,
        };
        console.log("FormData mis à jour:", updated);
        return updated;
      });

      // Mettre à jour les états de prix
      setSuggestedPrice(totalEstimatedPrice);
      setFinalPrice(totalEstimatedPrice);

      // Forcer le passage à l'étape suivante
      setTimeout(() => setCurrentStep(1), 100);

      toast.success("Prix estimés avec succès pour tous les colis");
    } catch (error) {
      console.error("Erreur détaillée lors de l'estimation des colis:", error);
      toast.error("Une erreur est survenue lors de l'estimation des colis");
    } finally {
      setLoading(false);
    }
  };

  // ÉTAPE 2: Créer la livraison avec les colis estimés
  const handleCreateDelivery = async () => {
    if (!formData.senderId) {
      toast.error("Veuillez sélectionner un expéditeur");
      return;
    }

    if (!formData.receiverId) {
      toast.error("Veuillez sélectionner un destinataire");
      return;
    }

    if (!formData.pickupAddress) {
      toast.error("Veuillez indiquer une adresse de ramassage");
      return;
    }

    if (!formData.deliveryAddress) {
      toast.error("Veuillez indiquer une adresse de livraison");
      return;
    }

    setLoading(true);

    console.log("finalPrice", finalPrice);

    try {
      const packageIds = estimatedPackages.map((pkg) => pkg.packageId);

      const deliveryData = {
        ...formData,
        pickupAddressNumber: Number(formData.pickupAddressNumber),
        deliveryAddressNumber: Number(formData.deliveryAddressNumber),
        estimatedPrice: finalPrice, // Prix ajusté
        actualPrice: formData.actualPrice ? Number(formData.actualPrice) : null,
        tripId: queryTripId ? queryTripId : formData.tripId || null,
        packageIds: packageIds,
      };

      await createDeliveryWithPackages(deliveryData, {
        onSuccess: (response) => {
          console.log("Livraison créée avec succès:", response);

          setCreatedPackageIds(response.data.packageIds);
          setCreatedDeliveryId(response.data.delivery.id);

          toast.success("Livraison créée avec succès!");
          setCurrentStep(2); // Passer à l'étape d'ajout d'images
        },
        onError: (error) => {
          console.error("Erreur lors de la création de la livraison:", error);
          toast.error(
            "Une erreur est survenue lors de la création de la livraison"
          );
        },
      });
    } catch (error) {
      console.error("Erreur lors de la création de la livraison:", error);
      toast.error(
        "Une erreur est survenue lors de la création de la livraison"
      );
    } finally {
      setLoading(false);
    }
  };

  // ÉTAPE 3: Ajouter les images aux colis
  const handleAddImagesToPackages = async () => {
    if (!createdPackageIds.length) {
      toast.error("Aucun colis trouvé pour ajouter des images");
      return;
    }

    setUploadingImages(true);

    try {
      // Pour chaque colis, ajouter les images correspondantes
      for (let i = 0; i < createdPackageIds.length; i++) {
        const packageId = createdPackageIds[i];
        const packageData = packages[i];

        // Vérifier si le package a des images
        if (packageData.images && packageData.images.length > 0) {
          // Vérifier la taille des fichiers avant upload
          const oversizedFiles = packageData.images.filter(
            (file: any) => file.size > 5 * 1024 * 1024 // 5MB limite
          );

          if (oversizedFiles.length > 0) {
            toast.error(
              `Colis ${i + 1} : ${
                oversizedFiles.length
              } image(s) trop volumineuse(s). Maximum 5MB par image.`
            );
            continue; // Passer au colis suivant
          }

          try {
            await addPackageImages({
              packageId: packageId,
              images: packageData.images,
            });
            toast.success(`Images ajoutées avec succès pour le colis ${i + 1}`);
          } catch (uploadError: any) {
            // Traitement personnalisé des erreurs d'upload
            if (uploadError?.response?.data?.message === "File too large") {
              toast.error(
                `Images trop volumineuses pour le colis ${
                  i + 1
                }. Maximum 5MB par image.`
              );
            } else if (uploadError?.response?.data?.message) {
              toast.error(
                `Erreur : ${uploadError.response.data.message} (Colis ${i + 1})`
              );
            } else {
              toast.error(
                `Erreur lors de l'ajout des images pour le colis ${i + 1}`
              );
            }
            console.error(
              `Erreur détaillée pour le colis ${packageId}:`,
              uploadError
            );
          }
        }
      }

      // Continuer même si certains uploads ont échoué
      toast.success("Processus de téléchargement terminé");
      router.push(`/admin/deliveries/${createdDeliveryId}/detail`);
    } catch (error: any) {
      // Gestion des erreurs générales
      console.error("Erreur lors de l'ajout des images:", error);

      // Afficher un message spécifique si l'erreur est liée à la taille du fichier
      if (error?.response?.data?.message === "File too large") {
        toast.error(
          "Impossible de télécharger une ou plusieurs images : fichier(s) trop volumineux (maximum 5MB par image)"
        );
      } else {
        toast.error("Une erreur est survenue lors de l'ajout des images");
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const handlePriceAdjustment = (value: number[]) => {
    const adjustment = value[0];
    setPriceAdjustment(adjustment);

    // Calculer le nouveau prix basé sur le pourcentage d'ajustement
    // Plage d'ajustement: -30% à +30%
    const adjustmentFactor = 1 + adjustment / 100;
    const newPrice = Math.max(
      1,
      Math.round(suggestedPrice * adjustmentFactor * 100) / 100
    );
    setFinalPrice(newPrice);
  };

  const handleReceiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewReceiverData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddReceiver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingReceiver(true);

    try {
      const payload = {
        firstName: newReceiverData.firstName,
        lastName: newReceiverData.lastName,
        email: newReceiverData.email,
        phone: newReceiverData.phone,
      };

      await createReceiver(payload, {
        onSuccess: (response) => {
          console.log("Destinataire créé avec succès :", response);
          receivers.push(response);

          setOpenReceiverDialog(false);

          // Réinitialiser le formulaire
          setNewReceiverData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
          });

          setFormData((prev) => ({
            ...prev,
            receiverId: response.id,
          }));

          toast.success("Destinataire ajouté avec succès !");
        },
        onError: (error) => {
          console.error("Erreur lors de la création du destinataire :", error);
          toast.error("Erreur lors de la création du destinataire");
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du destinataire:", error);
      toast.error("Erreur lors de l'ajout du destinataire");
    } finally {
      setIsAddingReceiver(false);
    }
  };

  if (loading && currentStep === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full min-h-screen max-w-5xl mx-auto">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {mode === "create"
            ? "Créer votre livraison"
            : "Modifier la livraison"}
        </h1>

        {queryTripId && (
          <div className="mb-4">
            <p className="text-sm font-bold">Informations du trajet</p>
            <p className="text-sm text-muted-foreground">
              De {retriveTrip?.startCity} à {retriveTrip?.endCity} le{" "}
              {new Date(retriveTrip?.startTime).toLocaleDateString()}
            </p>
          </div>
        )}

        <Tabs
          value={String(currentStep)}
          onValueChange={(value) => setCurrentStep(Number(value))}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="0" disabled={loading || currentStep < 0}>
              <Package className="mr-2 h-4 w-4" /> Colis
            </TabsTrigger>
            <TabsTrigger
              value="1"
              disabled={
                loading || estimatedPackages.length === 0 || currentStep < 1
              }
            >
              <Package className="mr-2 h-4 w-4" /> Livraison
            </TabsTrigger>
            <TabsTrigger
              value="2"
              disabled={loading || !createdDeliveryId || currentStep < 2}
            >
              <ImageDown className="mr-2 h-4 w-4" /> Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="0">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Étape 1: Créer et estimer les colis
              </h2>

              {/* Section des packages */}
              <PackageSectionForm
                packages={packages}
                setPackages={setPackages}
                openPackageModal={openPackageModal}
                setOpenPackageModal={setOpenPackageModal}
                addPackage={addPackage}
                editPackage={editPackage}
                removePackage={removePackage}
                setCurrentPackageIndex={setCurrentPackageIndex}
                handleChangePackage={() => {}}
                handleRemoveImage={() => {}}
                currentPackageIndex={currentPackageIndex}
              />

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleEstimatePackages}
                  disabled={packages.length === 0 || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Estimation en cours...
                    </>
                  ) : (
                    <>
                      Estimer les colis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="1">
            <DeliveryCreate
              estimatedPackages={estimatedPackages}
              suggestedPrice={suggestedPrice}
              newReceiverData={newReceiverData}
              setCurrentStep={setCurrentStep}
              currentStep={currentStep}
              loading={loading}
              queryTripId={queryTripId}
              setIsAddingReceiver={setIsAddingReceiver}
              formData={formData}
              setFormData={setFormData}
              loadingUsers={loadingUsers}
              receivers={receivers}
              trips={trips}
              loadingTrips={loadingTrips}
              handleChange={handleChange}
              handlePriceAdjustment={handlePriceAdjustment}
              finalPrice={finalPrice}
              priceAdjustment={priceAdjustment}
              setOpenReceiverDialog={setOpenReceiverDialog}
              openReceiverDialog={openReceiverDialog}
              handleAddReceiver={handleAddReceiver}
              handleReceiverChange={handleReceiverChange}
              isAddingReceiver={isAddingReceiver}
              session={session}
              handleCreateDelivery={handleCreateDelivery}
            />
          </TabsContent>

          <TabsContent value="2">
            <AddPicturesPackage
              packages={packages}
              setPackages={setPackages}
              createdPackageIds={createdPackageIds}
              setCurrentStep={setCurrentStep}
              handleAddImagesToPackages={handleAddImagesToPackages}
              uploadingImages={uploadingImages}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
