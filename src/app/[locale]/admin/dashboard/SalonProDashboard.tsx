"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { useGetSalonDashboardStats } from "@/app/data/hooks";
import { Calendar, DollarSign, Loader2 } from "lucide-react";
import Link from "next/link";

type PeriodKey = "today" | "yesterday" | "last7Days" | "last30Days";

interface PeriodStats {
  appointments?: number;
  revenue?: number;
}

export function SalonProDashboard({ salonId }: { salonId: string }) {
  const { data, isLoading } = useGetSalonDashboardStats(salonId);
  const payload = data as
    | { data?: Record<PeriodKey, PeriodStats> & { code?: number } }
    | null
    | undefined;
  const stats = payload?.data;

  const formatCad = (cents: number) =>
    new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#53745D]" />
      </div>
    );
  }

  if (!stats || typeof stats.code === "number") {
    return (
      <PageWrapper title="Tableau de bord salon">
        <p className="text-red-600">
          Impossible de charger les statistiques de votre salon.
        </p>
      </PageWrapper>
    );
  }

  const periods: { key: PeriodKey; label: string }[] = [
    { key: "today", label: "Aujourd’hui" },
    { key: "yesterday", label: "Hier" },
    { key: "last7Days", label: "7 derniers jours" },
    { key: "last30Days", label: "30 derniers jours" },
  ];

  return (
    <PageWrapper title="Tableau de bord salon">
      <p className="text-sm text-slate-600 mb-6">
        Indicateurs de votre établissement uniquement (rendez-vous et revenus
        estimés).
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {periods.map(({ key, label }) => {
          const p = stats[key];
          return (
            <div
              key={key}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <div className="mt-2 flex items-center gap-2 text-[#53745D]">
                <Calendar className="h-4 w-4" />
                <span className="text-2xl font-bold">{p?.appointments ?? 0}</span>
              </div>
              <p className="text-sm text-slate-600">Rendez-vous</p>
              <div className="mt-3 flex items-center gap-2 text-slate-800">
                <DollarSign className="h-4 w-4 text-[#53745D]" />
                <span className="text-lg font-semibold tabular-nums">
                  {formatCad(p?.revenue ?? 0)}
                </span>
              </div>
              <p className="text-xs text-slate-500">Revenus (centimes → CAD)</p>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/admin/bookings"
          className="text-sm font-semibold text-[#53745D] hover:underline"
        >
          Voir les réservations
        </Link>
        <Link
          href={`/admin/salons/${salonId}`}
          className="text-sm font-semibold text-[#53745D] hover:underline"
        >
          Fiche de mon salon
        </Link>
        <Link
          href="/admin/payments"
          className="text-sm font-semibold text-[#53745D] hover:underline"
        >
          Paiements
        </Link>
      </div>
    </PageWrapper>
  );
}
