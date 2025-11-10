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

export interface IStats {
  name: string;
  stat: string | number | undefined;
  href: string | null;
  icon?: any;
  color?: string;
}

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
  useSession();
  const [stats, setStats] = useState<IStats[]>([]);
  const { data: adminStats, isLoading: statsLoading } = useGetAdminStats();

  useEffect(() => {
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
  }, [adminStats]);

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
    </PageWrapper>
  );
}
