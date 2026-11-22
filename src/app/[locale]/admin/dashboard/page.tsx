/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign, Store } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  useGetAdminStats,
  useGetRevenueEvolution,
  useGetSalons,
  useGetUsers,
} from "@/app/data/hooks";
import dayjs from "dayjs";
import { EMPLOYEE, OWNER } from "@/shared/constantes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminKpiCards } from "./components/AdminKpiCards";
import { DashboardHero } from "./components/DashboardHero";
import { SalonProDashboard } from "./SalonProDashboard";

type EvolutionRange = "7" | "15" | "30" | "90" | "180" | "365";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
};

const getEvolutionDateParams = (range: EvolutionRange) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (Number(range) - 1));
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

const formatEvolutionDateLabel = (value: string) => {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-");
    return new Intl.DateTimeFormat("fr-CA", {
      month: "short",
      year: "2-digit",
    }).format(new Date(Number(year), Number(month) - 1, 1));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return dayjs(value).format("DD MMM");
  }
  return value;
};

export default function Dashboard() {
  const { data: session } = useSession();
  const salonUser = session?.user as
    | { role?: string; salonId?: string }
    | undefined;

  const [evolutionRange, setEvolutionRange] = useState<EvolutionRange>("30");
  const { data: adminStats, isLoading: statsLoading } = useGetAdminStats();
  const evolutionDateParams = getEvolutionDateParams(evolutionRange);
  const { data: evolutionData, isLoading: bookingEvolutionLoading } =
    useGetRevenueEvolution(evolutionDateParams);
  const { data: usersResponse, isLoading: usersLoading } = useGetUsers();
  const { data: salonsResponse, isLoading: salonsLoading } = useGetSalons({
    limit: 10000,
    offset: 0,
  });

  if (salonUser?.role === OWNER || salonUser?.role === EMPLOYEE) {
    if (!salonUser.salonId) {
      return (
        <PageWrapper title="Tableau de bord salon">
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
            Aucun salon n’est associé à votre compte. Contactez le support Korí.
          </p>
        </PageWrapper>
      );
    }
    return <SalonProDashboard salonId={salonUser.salonId} />;
  }

  const usersData = Array.isArray(usersResponse)
    ? usersResponse
    : usersResponse?.data || [];
  const salonsData = Array.isArray(salonsResponse?.data)
    ? salonsResponse.data
    : [];

  const getRangeLabel = (range: EvolutionRange) => {
    return `${range} derniers jours`;
  };

  const buildRegistrationEvolution = (
    source: any[],
    rangeInDays: number,
    options?: { filter?: (item: any) => boolean },
  ) => {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);
    periodStart.setDate(periodStart.getDate() - (rangeInDays - 1));

    const grouping: "day" | "week" | "month" =
      rangeInDays <= 30 ? "day" : rangeInDays <= 120 ? "week" : "month";

    const monthlyMap = new Map<string, number>();
    let initialCount = 0;

    source.forEach((item) => {
      if (options?.filter && !options.filter(item)) return;
      if (!item?.createdAt) return;

      const createdAt = new Date(item.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;

      if (createdAt < periodStart) {
        initialCount += 1;
        return;
      }

      let bucketDate: Date;
      if (grouping === "month") {
        bucketDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), 1);
      } else if (grouping === "week") {
        bucketDate = new Date(createdAt);
        const day = bucketDate.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        bucketDate.setDate(bucketDate.getDate() + mondayOffset);
        bucketDate.setHours(0, 0, 0, 0);
      } else {
        bucketDate = new Date(
          createdAt.getFullYear(),
          createdAt.getMonth(),
          createdAt.getDate(),
        );
      }

      const bucketKey = bucketDate.toISOString().split("T")[0];
      monthlyMap.set(bucketKey, (monthlyMap.get(bucketKey) || 0) + 1);
    });

    const labelFormatter =
      grouping === "month"
        ? new Intl.DateTimeFormat("fr-CA", { month: "short", year: "2-digit" })
        : new Intl.DateTimeFormat("fr-CA", { day: "2-digit", month: "short" });

    const incrementDate = (date: Date): Date => {
      const next = new Date(date);
      if (grouping === "month") {
        next.setMonth(next.getMonth() + 1);
      } else if (grouping === "week") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return next;
    };

    let cumulative = initialCount;
    const evolution = [];
    let cursor = new Date(periodStart);
    if (grouping === "month") {
      cursor = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
    } else if (grouping === "week") {
      const day = cursor.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      cursor.setDate(cursor.getDate() + mondayOffset);
    }

    while (cursor <= now) {
      const bucketKey = cursor.toISOString().split("T")[0];
      const newCount = monthlyMap.get(bucketKey) || 0;
      cumulative += newCount;

      evolution.push({
        month: labelFormatter.format(cursor),
        newCount,
        total: cumulative,
      });

      cursor = incrementDate(cursor);
    }

    return evolution;
  };

  const rangeInDays = Number(evolutionRange);
  const clientEvolutionData = buildRegistrationEvolution(
    usersData,
    rangeInDays,
    {
      filter: (user: any) => user?.role === "CLIENT",
    },
  );
  const salonEvolutionData = buildRegistrationEvolution(
    salonsData,
    rangeInDays,
  );
  const isChartsLoading = usersLoading || salonsLoading;

  const nonCumulativeCombinedData = salonEvolutionData.map((row, i) => ({
    period: row.month,
    nouveauxSalons: row.newCount,
    nouveauxClients: clientEvolutionData[i]?.newCount ?? 0,
  }));

  const bookingEvolutionRaw = evolutionData?.data || evolutionData || [];
  const bookingEvolutionSeries = (
    Array.isArray(bookingEvolutionRaw) ? bookingEvolutionRaw : []
  ).map((item: { date: string; bookings: number; platformFees: number }) => ({
    ...item,
    label: formatEvolutionDateLabel(item.date),
  }));
  const hasBookingEvolutionData = bookingEvolutionSeries.length > 0;

  return (
    <div className="container mx-auto px-2 py-6">
      <DashboardHero
        subtitle="Vue d'ensemble de la plateforme Korí"
        highlights={[
          {
            label: "Réservations aujourd'hui",
            value: adminStats?.data?.bookings?.today ?? "—",
          },
          {
            label: "Revenus payés ce mois",
            value: adminStats?.data
              ? formatCurrency(adminStats.data.revenue?.thisMonth || 0)
              : "—",
          },
        ]}
        actions={[
          { label: "Salons", href: "/admin/salons", icon: Store },
          { label: "Réservations", href: "/admin/bookings", icon: Calendar },
          { label: "Paiements", href: "/admin/payments", icon: DollarSign },
        ]}
      />

      <div className="mt-6">
        <AdminKpiCards data={adminStats?.data} isLoading={statsLoading} />
      </div>
      {!statsLoading && (
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="xl:col-span-2 rounded-lg bg-white p-4 shadow">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Période des graphiques d'inscriptions
                </h3>
                <p className="text-sm text-gray-500">
                  Filtre appliqué aux graphiques d&apos;inscriptions,
                  réservations et frais Korí
                </p>
              </div>
              <div className="w-full md:w-[240px]">
                <Select
                  value={evolutionRange}
                  onValueChange={(value) =>
                    setEvolutionRange(value as EvolutionRange)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 derniers jours</SelectItem>
                    <SelectItem value="15">15 derniers jours</SelectItem>
                    <SelectItem value="30">30 derniers jours</SelectItem>
                    <SelectItem value="90">90 derniers jours</SelectItem>
                    <SelectItem value="180">180 derniers jours</SelectItem>
                    <SelectItem value="365">365 derniers jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Évolution des salons inscrits
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Nombre cumulé de salons sur les {getRangeLabel(evolutionRange)}
            </p>
            {isChartsLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salonEvolutionData}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value}`, "Salons"]}
                      labelFormatter={(label: string) => `Mois: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#4A6854"
                      fill="#D6E3D8"
                      fillOpacity={0.45}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Évolution des clients inscrits
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Nombre cumulé de clients sur les {getRangeLabel(evolutionRange)}
            </p>
            {isChartsLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={clientEvolutionData}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value}`, "Clients"]}
                      labelFormatter={(label: string) => `Mois: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#53745D"
                      fill="#B8CFBC"
                      fillOpacity={0.45}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#53745D]" />
              Évolution des réservations
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Nombre de réservations créées sur les{" "}
              {getRangeLabel(evolutionRange)}
            </p>
            {bookingEvolutionLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : !hasBookingEvolutionData ? (
              <p className="text-sm text-gray-500 py-16 text-center">
                Aucune réservation sur cette période.
              </p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={bookingEvolutionSeries}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value}`,
                        "Réservations",
                      ]}
                      labelFormatter={(_label: string, payload) =>
                        payload?.[0]?.payload?.date
                          ? formatEvolutionDateLabel(
                              String(payload[0].payload.date),
                            )
                          : _label
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#53745D"
                      fill="#B8CFBC"
                      fillOpacity={0.45}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-[#4A6854]" />
              Frais de réservation Korí
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Commissions perçues (réservations payées) sur les{" "}
              {getRangeLabel(evolutionRange)}
            </p>
            {bookingEvolutionLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : !hasBookingEvolutionData ? (
              <p className="text-sm text-gray-500 py-16 text-center">
                Aucun frais sur cette période.
              </p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={bookingEvolutionSeries}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) =>
                        new Intl.NumberFormat("fr-CA", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(v)
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Frais Korí",
                      ]}
                      labelFormatter={(_label: string, payload) =>
                        payload?.[0]?.payload?.date
                          ? formatEvolutionDateLabel(
                              String(payload[0].payload.date),
                            )
                          : _label
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="platformFees"
                      stroke="#4A6854"
                      fill="#D6E3D8"
                      fillOpacity={0.45}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="xl:col-span-2 rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Inscriptions par période (non cumulé)
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Nombre de nouveaux salons et de nouveaux clients par intervalle sur
              les {getRangeLabel(evolutionRange)} — chaque barre correspond à la
              période affichée sur l&apos;axe, sans addition avec les périodes
              précédentes.
            </p>
            {isChartsLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <div className="h-72 w-full min-h-[288px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={nonCumulativeCombinedData}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                      minTickGap={8}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value}`,
                        name,
                      ]}
                      labelFormatter={(label: string) => `Période : ${label}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="nouveauxSalons"
                      name="Nouveaux salons"
                      fill="#4A6854"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="nouveauxClients"
                      name="Nouveaux clients"
                      fill="#7A9B82"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
