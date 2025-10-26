import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import FornAddReceiver from "../FormAddReceiver";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import AdressFormSection from "../AdressFormSection";
import { ITrip } from "@/app/interfaceHop";
import { Button } from "@/components/ui/button";

interface IProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: any;
  handleChange: any;
  handleCreateDelivery: any;
  loading: boolean;
  estimatedPackages: any[];
  suggestedPrice: number;
  priceAdjustment: number;
  finalPrice: number;
  handlePriceAdjustment: (value: number[]) => void;
  session: any;
  receivers: any[];
  loadingUsers: boolean;
  trips: any;
  loadingTrips: boolean;
  queryTripId: string | null;
  newReceiverData: any;
  handleAddReceiver: any;
  setOpenReceiverDialog: any;
  handleReceiverChange: any;
  openReceiverDialog: boolean;
  setIsAddingReceiver: any;
  isAddingReceiver: any;
  setFormData?: (data: any) => void;
}

export default function DeliveryCreate({
  currentStep,
  setCurrentStep,
  formData,
  handleChange,
  handleCreateDelivery,
  loading,
  estimatedPackages,
  suggestedPrice,
  priceAdjustment,
  finalPrice,
  handlePriceAdjustment,
  session,
  receivers,
  loadingUsers,
  trips,
  loadingTrips,
  queryTripId,
  setOpenReceiverDialog,
  newReceiverData,
  handleAddReceiver,
  isAddingReceiver,
  handleReceiverChange,
  openReceiverDialog,
  setIsAddingReceiver,
  setFormData,
}: IProps) {
  console.log("currentStep", currentStep);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Étape 2: Créer la livraison
      </h2>

      {/* Affichage des colis estimés */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Colis estimés</h3>
        <div className="space-y-2">
          {estimatedPackages.map((pkg, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 border rounded-md"
            >
              <div>
                <p className="font-medium">
                  {pkg.description || `Colis ${index + 1}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pkg.width}x{pkg.height}x{pkg.depth} cm, {pkg.weight} kg
                </p>
              </div>
              <div className="font-semibold">
                {pkg.estimatedPrice.toFixed(2)} €
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2 p-2 bg-muted rounded-md">
          <p className="font-medium">Prix total estimé:</p>
          <p className="font-bold text-lg">{suggestedPrice.toFixed(2)} €</p>
        </div>
      </div>

      {/* Ajustement du prix */}
      <div className="mb-6 p-4 border rounded-md bg-card">
        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <Label htmlFor="price-adjustment">
              Ajuster le prix ({priceAdjustment > 0 ? "+" : ""}
              {priceAdjustment}%)
            </Label>
            <span className="text-lg font-bold text-primary">
              {finalPrice.toFixed(2)} €
            </span>
          </div>

          <Slider
            id="price-adjustment"
            defaultValue={[0]}
            min={-30}
            max={30}
            step={1}
            value={[priceAdjustment]}
            onValueChange={handlePriceAdjustment}
            className="py-4"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-30%</span>
            <span className="font-medium">Prix suggéré</span>
            <span>+30%</span>
          </div>
        </div>

        {priceAdjustment < 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-700">
              <strong>Attention :</strong> Réduire le prix peut diminuer vos
              chances de trouver rapidement un transporteur.
            </p>
          </div>
        )}

        {priceAdjustment > 15 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              <strong>Excellent choix !</strong> Un prix plus élevé augmente
              significativement vos chances d&apos;obtenir un transporteur
              rapidement.
            </p>
          </div>
        )}
      </div>

      <form>
        {/* Sélection de l'expéditeur */}
        <div className="mb-0">
          <Label htmlFor="senderId">Expéditeur</Label>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {session?.user.firstName} {session?.user.lastName} (
          {session?.user.email})
        </p>

        {/* Sélection du destinataire */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="receiverId">Destinataire</Label>

            <FornAddReceiver
              setOpenReceiverDialog={setOpenReceiverDialog}
              newReceiverData={newReceiverData}
              handleAddReceiver={handleAddReceiver}
              isAddingReceiver={isAddingReceiver}
              handleReceiverChange={handleReceiverChange}
              openReceiverDialog={openReceiverDialog}
              setIsAddingReceiver={setIsAddingReceiver}
            />
          </div>

          {loadingUsers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement des utilisateurs...</span>
            </div>
          ) : (
            <Select
              value={formData.receiverId}
              onValueChange={(value) => handleChange("receiverId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un destinataire" />
              </SelectTrigger>
              <SelectContent>
                {receivers?.map((user: any) => (
                  <SelectItem key={user?.id} value={user?.id}>
                    {user?.firstName} {user?.lastName} ({user?.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Separator className="my-4 " />

        <AdressFormSection formData={formData} handleChange={handleChange} />

        {/* Instructions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="pickupInstructions">
              Instructions de ramassage
            </Label>
            <Textarea
              id="pickupInstructions"
              value={formData.pickupInstructions}
              onChange={(e) =>
                handleChange("pickupInstructions", e.target.value)
              }
              placeholder="Instructions pour le ramassage (optionnel)"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="deliveryInstructions">
              Instructions de livraison
            </Label>
            <Textarea
              id="deliveryInstructions"
              value={formData.deliveryInstructions}
              onChange={(e) =>
                handleChange("deliveryInstructions", e.target.value)
              }
              placeholder="Instructions pour la livraison (optionnel)"
              rows={3}
            />
          </div>
        </div>

        <Separator className="my-4 " />

        {/* Sélection du trajet */}
        <div className="mb-6">
          <Label htmlFor="tripId">Trajet associé (optionnel)</Label>
          {loadingTrips ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement des trajets...</span>
            </div>
          ) : (
            <Select
              value={formData.tripId || "none"}
              onValueChange={(value) =>
                handleChange("tripId", value === "none" ? "" : value)
              }
              disabled={!!queryTripId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un trajet (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun trajet</SelectItem>
                {trips?.trips?.map((trip: ITrip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    De {trip.startCity} à {trip.endCity} (
                    {new Date(trip.startTime).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(0)}
          >
            Retour aux colis
          </Button>
          <Button
            type="button"
            onClick={handleCreateDelivery}
            disabled={loading || !formData.receiverId}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                Créer la livraison
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
