"use client";

import { getSalonApi } from "@/app/data/services";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { resolveSalonTheme } from "../theme/salonTheme";
import type { PublicSalon } from "../types";

/** Salon public + thème du mini-site, pour les pages boutique hors de la page salon. */
export function useSalonPublic(salonId: string) {
  const query = useQuery({
    queryKey: ["salon-public", salonId],
    queryFn: async () => {
      const res = (await getSalonApi(salonId)) as { data?: PublicSalon } | null;
      return res?.data ?? null;
    },
    enabled: !!salonId,
    staleTime: 5 * 60_000,
  });
  const salon = query.data ?? null;
  const theme = useMemo(() => resolveSalonTheme(salon?.site ?? null), [salon?.site]);
  return { ...query, salon, theme };
}
