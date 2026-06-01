"use client";

import {
  useGetDefaultServices,
  useGetSalon,
  useGetSalonServices,
  useGetServiceCategories,
} from "@/app/data/hooks";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { DefaultService } from "./serviceForm";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SalonServiceItem {
  id: string;
  name: string;
  description?: string;
  particularities?: string;
  duration?: number;
  isActive: boolean;
  categoryId?: string;
  category?: { id: string; name: string };
  salonType?: string;
  group?: "WITH_OPTIONS" | "SIMPLE";
  requiresExtensions?: boolean;
  availableLocations?: ("SALON_ONLY" | "HOME_ONLY")[];
  travelFees?: number | null;
  options?: {
    id?: string;
    name: string;
    price: number;
    discountPrice?: number | null;
    thicknessOption?: "SMALL" | "MEDIUM" | "LARGE";
  }[];
  photos?: { id: string; url: string; isMain: boolean }[];
}

/**
 * Données partagées par la liste, la page de création et la page d'édition
 * des services (salon, types de salon, catégories filtrées, services par défaut).
 *
 * @param activeSalonType type de salon ciblé pour les catégories / services par
 *   défaut (ex: section "Maquillage"). Par défaut le premier type du salon.
 */
export function useMesServicesData(activeSalonType?: string) {
  const { data: session } = useSession();
  const user = session?.user as { salonId?: string } | undefined;
  const salonId = user?.salonId ?? "";

  const { data: servicesRes, isLoading: isLoadingServices } =
    useGetSalonServices(salonId);
  const { data: categoriesRes } = useGetServiceCategories();
  const { data: salonRes } = useGetSalon(salonId);

  const salonTypes: string[] = useMemo(() => {
    const raw = salonRes as any;
    const salon = raw?.data ?? raw;
    const types = salon?.salonTypes;
    return Array.isArray(types) && types.length ? types : ["HAIRDRESSER"];
  }, [salonRes]);

  // Type actif : paramètre fourni (si valide pour ce salon) sinon premier type
  const salonType = useMemo(() => {
    if (activeSalonType && salonTypes.includes(activeSalonType))
      return activeSalonType;
    return salonTypes[0];
  }, [activeSalonType, salonTypes]);

  const { data: defaultServicesRes } = useGetDefaultServices({ salonType });

  const services: SalonServiceItem[] = useMemo(() => {
    const raw = servicesRes as any;
    return Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  }, [servicesRes]);

  const allCategories: { id: string; name: string; salonTypes?: string[] }[] =
    useMemo(() => {
      const raw = categoriesRes as any;
      return Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    }, [categoriesRes]);

  // Catégories filtrées par type de salon (parité mobile)
  const categories = useMemo(
    () =>
      allCategories.filter(
        (c) => !c.salonTypes?.length || c.salonTypes.includes(salonType),
      ),
    [allCategories, salonType],
  );

  const defaultServices: DefaultService[] = useMemo(() => {
    const raw = defaultServicesRes as any;
    return Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  }, [defaultServicesRes]);

  return {
    salonId,
    salonType,
    salonTypes,
    services,
    categories,
    defaultServices,
    isLoadingServices,
  };
}
