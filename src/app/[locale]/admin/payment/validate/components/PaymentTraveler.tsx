"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  useGetDeliveryById,
  useGetTrip,
  useVerifyPaymentKeyAndPayTraveler,
} from "@/app/data/hooksHop";
import { useRouter } from "next/navigation";

interface IProps {
  tripId: string | string[] | undefined;
  deliveryId: string | string[] | undefined;
  setOpenModalPaiement?: any;
  openModalPaiement?: boolean;
}

export default function PaymentTraveler({
  tripId,
  deliveryId,
  setOpenModalPaiement,
  openModalPaiement,
}: IProps) {
  const router = useRouter();

  // État pour le code de validation
  const [validationCode, setValidationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: verifyPayement } = useVerifyPaymentKeyAndPayTraveler();

  // Récupération des données du trajet et de la livraison
  const { data: tripDetails, isLoading: loadingTrip } = useGetTrip(
    tripId as string
  );
  const { data: deliveryDetails, isLoading: loadingDelivery } =
    useGetDeliveryById(deliveryId as string);

  const isLoading = loadingTrip || loadingDelivery;

  // Fonction de validation du code
  const validatePayment = async () => {
    if (validationCode.length !== 5) {
      toast.error("Veuillez entrer un code à 5 caractères");
      return;
    }

    const fullCode = `PAY-${validationCode}`;
    setIsSubmitting(true);

    try {
      // Simuler une vérification (à remplacer par votre API)
      await verifyPayement(
        {
          deliveryId: deliveryId as string,
          tripId: tripId as string,
          paymentKey: fullCode as string,
        },
        {
          onSuccess: () => {
            toast.success("vous recevez votre paiement sous 48/72h");
            if (openModalPaiement) {
              setOpenModalPaiement(false);
              window.location.reload();
            } else {
              router.push(`/admin/trips/${tripId}/detail`);
            }

            // Rediriger ou effectuer d'autres actions après la validation
          },
          onError: (error) => {
            toast.error("Erreur lors de la validation du paiement");
            console.error(error);
          },
        }
      );
    } catch (error) {
      toast.error("Une erreur est survenue lors de la validation");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Validation du paiement</CardTitle>
        <CardDescription>
          Entrez le code de paiement fourni par l&apos;expéditeur
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-2">
              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium mb-1">Détails de la livraison</p>
                <p className="text-sm">
                  Tracking: {deliveryDetails?.trackingNumber}
                </p>
                <p className="text-sm">
                  De {deliveryDetails?.pickupCity} à{" "}
                  {deliveryDetails?.deliveryCity}
                </p>
                {/* <p className="text-sm font-medium mt-2">
                    Montant: {deliveryDetails?.estimatedPrice} €
                  </p> */}
              </div>
            </div>

            <div className="text-center mb-6">
              <label
                htmlFor="validationCode"
                className="block text-sm font-medium mb-2"
              >
                Code de paiement
              </label>
              <div className="flex items-center max-w-xs mx-auto">
                <div className="px-3 py-1 bg-gray-100 rounded-l-md border border-gray-300 border-r-0">
                  PAY-
                </div>
                <Input
                  id="validationCode"
                  placeholder="XXXXX"
                  value={validationCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    // Limiter à 4 caractères et uniquement lettres/chiffres
                    if (/^[A-Z0-9]*$/.test(value) && value.length <= 5) {
                      setValidationCode(value);
                    }
                  }}
                  className="text-center text-2xl tracking-wider rounded-l-none"
                  maxLength={5}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={validatePayment}
          className="w-full"
          disabled={validationCode.length !== 5 || isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validation...
            </>
          ) : (
            "Valider le paiement"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
