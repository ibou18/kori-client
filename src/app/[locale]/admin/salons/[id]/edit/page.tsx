"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { SalonForm, SalonFormValues } from "@/app/components/SalonForm";
import { useGetSalon, useUpdateSalon } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

export default function EditSalonPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const salonId = params?.id as string;

  const { data: salonData, isLoading, error } = useGetSalon(salonId);
  const { mutate: updateSalon, isPending: isSubmitting } = useUpdateSalon();

  // Normaliser les données
  const salon = salonData?.data || salonData || null;

  if (!session) {
    return (
      <PageWrapper title="Modifier le salon">
        <p className="text-center mt-10">
          Connexion requise pour accéder à cette page!
        </p>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper title="Modifier le salon">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !salon) {
    return (
      <PageWrapper title="Modifier le salon">
        <div className="text-center mt-10">
          <p className="text-red-600 mb-4">
            {error
              ? "Erreur lors du chargement du salon"
              : "Salon non trouvé"}
          </p>
          <Button
            onClick={() => router.push("/admin/salons")}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const handleSubmit = (values: SalonFormValues) => {
    updateSalon(
      {
        id: salonId,
        data: values,
      },
      {
        onSuccess: () => {
          router.push(`/admin/salons/${salonId}`);
        },
      }
    );
  };

  return (
    <PageWrapper
      title={`Modifier le salon: ${salon.name}`}
      description="Modifiez les informations du salon"
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/salons/${salonId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      }
    >
      <SalonForm salon={salon} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </PageWrapper>
  );
}

