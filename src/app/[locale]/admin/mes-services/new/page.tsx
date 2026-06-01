"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceFormView } from "../components/ServiceFormView";
import { getSalonTypeText } from "../components/serviceForm";
import { useMesServicesData } from "../components/useMesServicesData";

export default function NewServicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("salonType") ?? undefined;

  // Le type effectif est validé contre les types du salon par le hook
  const { salonId, salonType, categories, defaultServices } =
    useMesServicesData(requestedType);

  const goBack = () => router.push("/admin/mes-services");

  if (!salonId) {
    return (
      <PageWrapper title="Nouveau service">
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Aucun salon associé à votre compte.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={`Nouveau service – ${getSalonTypeText(salonType)}`}>
      <div className="mb-4">
        <Button variant="ghost" onClick={goBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux services
        </Button>
      </div>
      <ServiceFormView
        salonId={salonId}
        salonType={salonType}
        categories={categories}
        defaultServices={defaultServices}
        editingService={null}
        onDone={goBack}
      />
    </PageWrapper>
  );
}
