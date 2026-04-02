/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Store,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import PageWrapper from "@/app/components/block/PageWrapper";
import { useGetAdminStats } from "@/app/data/hooks";
import { useGetSalons, useGetUsers } from "@/app/data/hooks";
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

import { SalonProDashboard } from "./SalonProDashboard";

export interface IStats {
  name: string;
  stat: string | number | undefined;
  href: string | null;
  icon?: any;
  color?: string;
}

type EvolutionRange = "7" | "15" | "30" | "90" | "180" | "365";

const StatCard = ({ item }: { item: IStats }) => (
  <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 transition-all hover:shadow-lg">
    <div className="flex justify-between items-center">
      <dt className="truncate text-sm font-bold text-slate-800">{item.name}</dt>
      <div className={`p-2 rounded-full ${item.color || "bg-[#F0F4F1]"}`}>
        {item.icon || <DollarSign className="w-4 h-4 text-[#53745D]" />}
      </div>
    </div>
    <dd className="mt-1 text-4xl font-semibold tracking-tight text-[#53745D]">
      {item.stat}
    </dd>
    {item.href && (
      <Link
        className="mt-2 inline-flex items-center text-sm font-medium text-[#53745D] hover:text-[#4A6854]"
        href={item.href}
      >
        Voir détails
        <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    )}
  </div>
);

const StatCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>
    <Skeleton className="mt-1 h-10 w-24" />
    <Skeleton className="mt-2 h-4 w-28" />
  </div>
);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
};

export default function Dashboard() {
  const { data: session } = useSession();
  const salonUser = session?.user as
    | { role?: string; salonId?: string }
    | undefined;

  const [stats, setStats] = useState<IStats[]>([]);
  const [evolutionRange, setEvolutionRange] = useState<EvolutionRange>("30");
  const { data: adminStats, isLoading: statsLoading } = useGetAdminStats();
  const { data: usersResponse, isLoading: usersLoading } = useGetUsers();
  const { data: salonsResponse, isLoading: salonsLoading } = useGetSalons({
    limit: 10000,
    offset: 0,
  });

  useEffect(() => {
    if (salonUser?.role === OWNER || salonUser?.role === EMPLOYEE) return;
    if (adminStats?.data) {
      const statsData = adminStats.data;
      const newStats: IStats[] = [
        {
          name: "Total Utilisateurs",
          stat: statsData.users?.total || 0,
          href: "/admin/users",
          icon: <Users className="w-4 h-4 text-[#53745D]" />,
          color: "bg-[#F0F4F1]",
        },
        {
          name: "Total Salons",
          stat: statsData.salons?.total || 0,
          href: "/admin/salons",
          icon: <Store className="w-4 h-4 text-[#4A6854]" />,
          color: "bg-[#D6E3D8]",
        },
        {
          name: "Réservations Aujourd'hui",
          stat: statsData.bookings?.today || 0,
          href: "/admin/bookings",
          icon: <Calendar className="w-4 h-4 text-[#53745D]" />,
          color: "bg-[#F0F4F1]",
        },
        {
          name: "Revenus Totaux",
          stat: formatCurrency(statsData.revenue?.total || 0),
          href: "/admin/payments",
          icon: <DollarSign className="w-4 h-4 text-[#53745D]" />,
          color: "bg-[#F0F4F1]",
        },
        {
          name: "Revenus Ce Mois",
          stat: formatCurrency(statsData.revenue?.thisMonth || 0),
          href: "/admin/payments",
          icon: <TrendingUp className="w-4 h-4 text-[#4A6854]" />,
          color: "bg-[#D6E3D8]",
        },
        {
          name: "Réservations Total",
          stat: statsData.bookings?.total || 0,
          href: "/admin/bookings",
          icon: <Calendar className="w-4 h-4 text-[#3F5749]" />,
          color: "bg-[#B8CFBC]",
        },
      ];
      setStats(newStats);
    }
  }, [adminStats, salonUser?.role]);

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

  return (
    <PageWrapper title="Dashboard Admin">
      {/* Stats Cards */}
      {statsLoading ? (
        <dl className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </dl>
      ) : (
        <dl className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stats?.map((item) => (
            <StatCard key={item.name} item={item} />
          ))}
        </dl>
      )}

      {/* Détails des statistiques */}
      {!statsLoading && adminStats?.data && (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Utilisateurs */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#53745D]" />
              Utilisateurs
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Clients</span>
                <span className="font-semibold">
                  {adminStats.data.users?.clients || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Propriétaires</span>
                <span className="font-semibold">
                  {adminStats.data.users?.owners || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Employés</span>
                <span className="font-semibold">
                  {adminStats.data.users?.employees || 0}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Actifs</span>
                  <span className="font-semibold text-[#53745D] flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {adminStats.data.users?.active || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Inactifs</span>
                  <span className="font-semibold text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {adminStats.data.users?.inactive || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Salons */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Store className="w-5 h-5 mr-2 text-[#4A6854]" />
              Salons
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Actifs</span>
                <span className="font-semibold text-[#53745D] flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {adminStats.data.salons?.active || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inactifs</span>
                <span className="font-semibold text-red-600 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  {adminStats.data.salons?.inactive || 0}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vérifiés</span>
                  <span className="font-semibold text-[#53745D]">
                    {adminStats.data.salons?.verified || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Non vérifiés</span>
                  <span className="font-semibold text-yellow-600">
                    {adminStats.data.salons?.unverified || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Réservations */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#53745D]" />
              Réservations
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aujourd'hui</span>
                <span className="font-semibold">
                  {adminStats.data.bookings?.today || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cette semaine</span>
                <span className="font-semibold">
                  {adminStats.data.bookings?.thisWeek || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ce mois</span>
                <span className="font-semibold">
                  {adminStats.data.bookings?.thisMonth || 0}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Terminées</span>
                  <span className="font-semibold text-[#53745D]">
                    {adminStats.data.bookings?.completed || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">En attente</span>
                  <span className="font-semibold text-yellow-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {adminStats.data.bookings?.pending || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Annulées</span>
                  <span className="font-semibold text-red-600">
                    {adminStats.data.bookings?.cancelled || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenus */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-[#53745D]" />
              Revenus
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aujourd'hui</span>
                <span className="font-semibold text-[#53745D]">
                  {formatCurrency(adminStats.data.revenue?.today || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cette semaine</span>
                <span className="font-semibold">
                  {formatCurrency(adminStats.data.revenue?.thisWeek || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ce mois</span>
                <span className="font-semibold text-[#4A6854]">
                  {formatCurrency(adminStats.data.revenue?.thisMonth || 0)}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[#53745D]">
                    {formatCurrency(adminStats.data.revenue?.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!statsLoading && (
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="xl:col-span-2 rounded-lg bg-white p-4 shadow">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Période des graphiques d'inscriptions
                </h3>
                <p className="text-sm text-gray-500">
                  Filtre appliqué aux évolutions salons et clients
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
    </PageWrapper>
  );
}
