"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  MapIcon,
  CalendarIcon,
  PackageIcon,
  DollarSignIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";

// Version animée des composants Card
const MotionCard = motion(Card);

// Configuration des animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as any,
      stiffness: 100,
      damping: 12,
    },
  },
};

// Configuration des couleurs thématiques pour chaque type de statistique
const STAT_THEMES = {
  trips: {
    bg: "bg-blue-50",
    icon: "text-blue-500",
    text: "text-blue-700",
  },
  planned: {
    bg: "bg-amber-50",
    icon: "text-amber-500",
    text: "text-amber-700",
  },
  completed: {
    bg: "bg-green-50",
    icon: "text-green-500",
    text: "text-green-700",
  },
  deliveries: {
    bg: "bg-purple-50",
    icon: "text-purple-500",
    text: "text-purple-700",
  },
  amount: {
    bg: "bg-emerald-50",
    icon: "text-emerald-500",
    text: "text-emerald-700",
  },
  delivered: {
    bg: "bg-cyan-50",
    icon: "text-cyan-500",
    text: "text-cyan-700",
  },
};

// Composant pour une carte de statistique avec animation et thème
function StatCard({
  title,
  value,
  description,
  icon,
  theme,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: JSX.Element;
  theme: keyof typeof STAT_THEMES;
}) {
  return (
    <MotionCard
      variants={item}
      className={`overflow-hidden border-none shadow-md ${STAT_THEMES[theme].bg} transition-all hover:shadow-lg`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <motion.div
          className={`p-2 rounded-full ${STAT_THEMES[theme].bg}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {React.cloneElement(icon, {
            className: `h-4 w-4 ${STAT_THEMES[theme].icon}`,
          })}
        </motion.div>
      </CardHeader>
      <CardContent>
        <motion.div
          className={`text-2xl font-bold ${STAT_THEMES[theme].text}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        >
          {value}
        </motion.div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </MotionCard>
  );
}

export default function CardHeaderStats({
  deliveryStats,
  tripsStats,
}: {
  deliveryStats: any;
  tripsStats: any;
}) {
  const deliveryRate =
    tripsStats?.tripsByStatus.completed > 0
      ? (
          tripsStats?.deliveriesCount / tripsStats?.tripsByStatus.completed
        ).toFixed(1)
      : "0";

  const plannedPercentage = tripsStats?.totalTrips
    ? (
        (tripsStats.tripsByStatus.planned / tripsStats.totalTrips) *
        100
      ).toFixed(1)
    : "0";

  const completedPercentage = tripsStats?.totalTrips
    ? (
        (tripsStats.tripsByStatus.completed / tripsStats.totalTrips) *
        100
      ).toFixed(1)
    : "0";

  const deliveredPercentage = deliveryStats?.totalDeliveries
    ? (
        ((deliveryStats.statusCount.DELIVERED || 0) /
          deliveryStats.totalDeliveries) *
        100
      ).toFixed(1)
    : "0";

  return (
    <div className="space-y-8">
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <StatCard
          title="Total des voyages"
          value={tripsStats?.totalTrips || 0}
          description="Tous les voyages enregistrés"
          icon={<MapIcon />}
          theme="trips"
        />

        <StatCard
          title="Voyages planifiés"
          value={tripsStats?.tripsByStatus.planned || 0}
          description={`${plannedPercentage}% du total`}
          icon={<CalendarIcon />}
          theme="planned"
        />

        <StatCard
          title="Voyages terminés"
          value={tripsStats?.tripsByStatus.completed || 0}
          description={`${completedPercentage}% du total`}
          icon={<CheckCircleIcon />}
          theme="completed"
        />

        <StatCard
          title="Livraisons totales"
          value={tripsStats?.deliveriesCount || 0}
          description={`Moyenne de ${deliveryRate} par voyage terminé`}
          icon={<PackageIcon />}
          theme="deliveries"
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <StatCard
          title="Total des livraisons"
          value={deliveryStats?.totalDeliveries || 0}
          description="Livraisons effectuées et en cours"
          icon={<ClockIcon />}
          theme="deliveries"
        />

        <StatCard
          title="Montant total"
          value={`${
            deliveryStats?.totalAmount
              ? deliveryStats.totalAmount.toFixed(2)
              : "0.00"
          } $`}
          description="Valeur des livraisons"
          icon={<DollarSignIcon />}
          theme="amount"
        />

        <StatCard
          title="Livraisons terminées"
          value={deliveryStats?.statusCount?.DELIVERED || 0}
          description={`${deliveredPercentage}% du total`}
          icon={<TruckIcon />}
          theme="delivered"
        />
      </motion.div>
    </div>
  );
}
