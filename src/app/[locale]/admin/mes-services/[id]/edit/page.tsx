"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  EditableService,
  ServiceFormView,
} from "../../components/ServiceFormView";
import { useMesServicesData } from "../../components/useMesServicesData";

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const serviceId = params?.id as string;
  const requestedType = searchParams.get("salonType") ?? undefined;

  const {
    salonId,
    salonType,
    categories,
    defaultServices,
    services,
    isLoadingServices,
  } = useMesServicesData(requestedType);

  const goBack = () => router.push("/admin/mes-services");

  const editingService: EditableService | null = useMemo(() => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return null;
    return {
      id: svc.id,
      name: svc.name,
      description: svc.description,
      particularities: svc.particularities,
      duration: svc.duration,
      categoryId: svc.categoryId ?? svc.category?.id,
      category: svc.category,
      group: svc.group,
      requiresExtensions: svc.requiresExtensions,
      availableLocations: svc.availableLocations,
      travelFees: svc.travelFees,
      options: svc.options,
      photos: svc.photos,
    };
  }, [services, serviceId]);

  return (
    <PageWrapper title="Modifier le service">
      <div className="mb-4">
        <Button variant="ghost" onClick={goBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux services
        </Button>
      </div>

      {!salonId ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Aucun salon associé à votre compte.
        </p>
      ) : isLoadingServices ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !editingService ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Service introuvable. Il a peut-être été supprimé.
        </p>
      ) : (
        <ServiceFormView
          salonId={salonId}
          salonType={salonType}
          categories={categories}
          defaultServices={defaultServices}
          editingService={editingService}
          onDone={goBack}
        />
      )}
    </PageWrapper>
  );
}
