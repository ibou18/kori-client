"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { SalonForm, SalonFormValues } from "@/app/components/SalonForm";
import { useCreateSalon } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function NewSalonPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { mutate: createSalon, isPending: isSubmitting } = useCreateSalon();

  if (!session) {
    return (
      <PageWrapper title="Créer un salon">
        <p className="text-center mt-10">
          Connexion requise pour accéder à cette page!
        </p>
      </PageWrapper>
    );
  }

  const handleSubmit = (values: SalonFormValues) => {
    createSalon(values, {
      onSuccess: (data) => {
        const salonId = data?.data?.id || data?.id;
        if (salonId) {
          router.push(`/admin/salons/${salonId}`);
        } else {
          router.push("/admin/salons");
        }
      },
    });
  };

  return (
    <PageWrapper
      title="Créer un nouveau salon"
      description="Remplissez le formulaire pour créer un nouveau salon"
      actions={
        <Button variant="outline" onClick={() => router.push("/admin/salons")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      }
    >
      <SalonForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </PageWrapper>
  );
}

