/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { ADMIN } from "@/shared/constantes";
import {
  useGetTripStats,
  useGetUsers,
  useGetDeliveryStats,
  useGetDeliveries,
  useGetUser,
} from "@/app/data/hooksHop";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  CalendarIcon,
  DollarSign,
  DollarSignIcon,
  MapIcon,
  Package,
  PackageIcon,
  Truck,
  TruckIcon,
} from "lucide-react";

import DeliveryStats from "./components/DeliveryStats";
import TravelerStats from "./components/TripsStats";
import CardHeaderStats from "./components/CardHeaderStats";

export interface IStats {
  name: string;
  stat: string | number | undefined;
  href: string | null;
  icon?: any;
}

const StatCard = ({ item }: { item: IStats }) => (
  <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 transition-all hover:shadow-lg">
    <div className="flex justify-between items-center">
      <dt className="truncate text-sm font-bold text-slate-800">{item.name}</dt>
      <div className={`p-2 rounded-full bg-orange-100`}>
        {item.icon || <DollarSign className="w-4 h-4 text-orange-500" />}
      </div>
    </div>
    <dd className="mt-1 text-4xl font-semibold tracking-tight text-orange-500">
      {item.stat}
    </dd>
    {item.href && (
      <Link
        className="mt-2 inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
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

// Skeletons pour les états de chargement
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

const DeliveryStatsSkeleton = () => (
  <div className="space-y-6 mt-6">
    <Skeleton className="h-7 w-56" />

    {/* Cards */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-36 mt-2" />
        </div>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-lg bg-white p-6 shadow">
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="h-80 w-full rounded-md" />
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="h-80 w-full rounded-md" />
      </div>
    </div>
  </div>
);

const TripStatsSkeleton = () => (
  <div className="space-y-6 mt-6">
    <Skeleton className="h-7 w-56" />

    {/* Cards */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-36 mt-2" />
        </div>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-lg bg-white p-6 shadow">
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="h-80 w-full rounded-md" />
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="h-80 w-full rounded-md" />
      </div>
    </div>

    {/* Upcoming trips */}
    <div className="rounded-lg bg-white p-6 shadow">
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b pb-4"
          >
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16 mt-1 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<IStats[]>([]);
  const { data: session }: any = useSession();
  const [openStripeModal, setOpenStripeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("deliveries");

  const { data: userConnected, isLoading: userLoading } = useGetUser(
    session?.user?.id
  );

  const { data: user, isLoading: usersLoading } = useGetUsers();
  const { data: tripsStats, isLoading: tripsLoading } = useGetTripStats();
  const { data: deliveryStats, isLoading: deliveryStatsLoading } =
    useGetDeliveryStats();
  const { data: deliveries, isLoading: deliveriesLoading } = useGetDeliveries();

  useEffect(() => {
    if (
      userConnected?.role === "TRAVELER" &&
      userConnected?.hasStripeConnectAccount === false &&
      userConnected?.stripeAccountLink
    ) {
      setOpenStripeModal(true);
    }
  }, [userConnected]);

  return (
    <PageWrapper title="Dashboard">
      {/* Stats Cards */}
      {usersLoading ? (
        <dl className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </dl>
      ) : (
        <dl
          className={`mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-${
            session?.user?.role === ADMIN ? 3 : 2
          }`}
        >
          {stats?.map((item) => (
            <StatCard key={item.name} item={item} />
          ))}
        </dl>
      )}

      <CardHeaderStats tripsStats={tripsStats} deliveryStats={deliveryStats} />

      {/* Tabs pour les statistiques */}
      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deliveries" className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Statistiques de livraisons
            </TabsTrigger>
            <TabsTrigger value="trips" className="flex items-center">
              <Truck className="mr-2 h-4 w-4" />
              Statistiques de voyages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="mt-6">
            {deliveryStatsLoading ? (
              <DeliveryStatsSkeleton />
            ) : (
              <DeliveryStats data={deliveryStats} />
            )}
          </TabsContent>

          <TabsContent value="trips" className="mt-6">
            {tripsLoading ? (
              <TripStatsSkeleton />
            ) : (
              <TravelerStats data={tripsStats} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Stripe Connect Modal */}
      <Dialog open={openStripeModal} onOpenChange={setOpenStripeModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connectez votre compte Stripe</DialogTitle>
            <DialogDescription>
              Pour recevoir vos paiements en tant que voyageur, veuillez
              connecter votre compte Stripe.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              Veuillez suivre les étapes sur Stripe pour valider complètement
              votre compte.
            </p>
          </div>
          <Button
            onClick={() => {
              window.open(
                userConnected?.stripeAccountLink || "",
                "_blank",
                "noopener,noreferrer"
              );
            }}
          >
            Connecter mon compte Stripe
          </Button>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
