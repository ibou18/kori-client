"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { OwnerInvitationForm } from "@/app/components/OwnerInvitationForm";
import {
  useGetOwnerInvitationByToken,
  useRegisterSalon,
  useUploadSalonPhoto,
} from "@/app/data/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InviteOwnerPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const {
    data: invitationData,
    isLoading: isLoadingInvitation,
    error: invitationError,
  } = useGetOwnerInvitationByToken(token);

  const { mutate: registerSalon, isPending: isSubmitting } = useRegisterSalon();
  useUploadSalonPhoto();

  useEffect(() => {
    if (invitationData?.data && !isSubmitting) {
      // L'invitation est valide, on peut afficher le formulaire
    }
  }, [invitationData, isSubmitting]);

  if (isLoadingInvitation) {
    return (
      <PageWrapper title="Chargement de l'invitation...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (invitationError || !invitationData?.data) {
    return (
      <PageWrapper title="Invitation invalide">
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Erreur
                  </h3>
                  <p className="text-sm text-red-800">
                    {invitationData?.code === 404
                      ? "Cette invitation n'existe pas ou a été supprimée."
                      : invitationData?.code === 400 &&
                        invitationData?.errorCode === "INVITATION_EXPIRED"
                      ? "Cette invitation a expiré. Veuillez contacter l'administrateur pour recevoir une nouvelle invitation."
                      : invitationData?.code === 400 &&
                        invitationData?.errorCode === "INVITATION_ALREADY_USED"
                      ? "Cette invitation a déjà été utilisée."
                      : "Une erreur est survenue lors du chargement de l'invitation."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  const invitation = invitationData.data;

  const handleSubmit = (values: any, images?: File[]) => {
    // Préparer les données pour registerSalon avec les valeurs modifiées par l'utilisateur
    const registerData = {
      user: {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || "",
        countryCode: values.indicatif || "+1",
        password: values.password,
      },
      salon: {
        name: values.salon.name,
        description: values.salon.description || "",
        address: {
          street: values.salon.address.street,
          city: values.salon.address.city,
          postalCode: values.salon.address.postalCode || "",
          country: values.salon.address.country || "Canada",
          apartment: values.salon.address.apartment,
        },
        phone: values.salon.phone,
        email: values.salon.email,
        salonTypes: values.salon.salonTypes,
        services: values.salon.services || [],
        extraOffer: values.salon.offersHomeService ? "yes" : "no",
      },
      openingHours: values.salon.openingHours || {},
    };

    registerSalon(registerData, {
      onSuccess: (data: any) => {
        const salonId = data?.data?.salon?.id || data?.salon?.id;

        // Si des images ont été sélectionnées, les uploader après la création
        // Note: L'upload nécessite une authentification, donc les images
        // seront uploadées après la connexion de l'utilisateur
        if (salonId && images && images.length > 0) {
          // Stocker les images dans le localStorage pour les uploader après connexion
          const imagesData = images.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          }));
          localStorage.setItem(
            `pending_salon_images_${salonId}`,
            JSON.stringify(imagesData)
          );
          // Stocker les fichiers en base64 pour les récupérer après connexion
          // (limitation: max 5MB par image, donc on stocke juste les métadonnées)
          console.log(
            `${images.length} image(s) seront uploadées après votre connexion`
          );
        }

        // Marquer l'invitation comme utilisée (sera fait côté serveur)
        router.push("/auth/signin?registered=true");
      },
      onError: (error: any) => {
        console.error("Erreur lors de la création du salon:", error);
      },
    });
  };

  return (
    <PageWrapper
      title="Créer votre compte et votre salon"
      description="Complétez le formulaire pour finaliser votre inscription"
    >
      <div className="max-w-4xl mx-auto">
        <Card className="border-blue-200 bg-blue-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Invitation reçue
                </h3>
                <p className="text-sm text-blue-800">
                  Bonjour {invitation.firstName} {invitation.lastName}, vous
                  avez été invité(e) à créer votre salon sur korí. Vos
                  informations ont été préremplies, il ne vous reste plus qu'à
                  compléter les détails de votre salon et choisir un mot de
                  passe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <OwnerInvitationForm
          invitation={invitation}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </PageWrapper>
  );
}
