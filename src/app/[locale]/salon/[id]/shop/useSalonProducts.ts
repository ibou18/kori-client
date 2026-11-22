"use client";

import { getSalonProductsApi } from "@/app/data/services";
import { useQuery } from "@tanstack/react-query";
import type { SalonProductsPayload } from "./types";

const EMPTY: SalonProductsPayload = { salesEnabled: false, products: [] };

/** Boutique publique d'un salon ; en cas d'erreur, boutique masquée (jamais bloquant). */
export function useSalonProducts(salonId: string) {
  const query = useQuery({
    queryKey: ["salon-products", salonId],
    queryFn: async (): Promise<SalonProductsPayload> => {
      try {
        const res = (await getSalonProductsApi(salonId)) as { data?: SalonProductsPayload } | null;
        return res?.data ?? EMPTY;
      } catch {
        return EMPTY;
      }
    },
    enabled: !!salonId,
    staleTime: 60_000,
  });
  const data = query.data ?? EMPTY;
  return {
    ...query,
    salesEnabled: data.salesEnabled,
    products: data.salesEnabled ? data.products.filter((p) => p.inStock) : [],
  };
}
