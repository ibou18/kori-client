import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageIcon, ChevronRightIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import Link from "next/link";

// Versions animées des composants
const MotionCard = motion(Card);
const MotionBadge = motion(Badge);

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const chartVariants: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] }, // cubic-bezier for 'easeOut'
  },
};

export default function DeliveryStats({ data }: { data: any }) {
  // Couleurs pour les graphiques
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const STATUS_COLORS: Record<string, string> = {
    RESERVED: "#FFBB28", // jaune
    ACCEPTED: "#0088FE", // bleu
    DELIVERED: "#00C49F", // vert
    CANCELLED: "#FF8042", // orange
    PENDING: "#8884d8", // violet
    UNASSIGNED: "#7e7a70", // jaune
  };

  // Formatage des données pour le graphique en camembert
  const statusData = Object.entries(data?.statusCount || {})?.map(
    ([status, count]) => ({
      name: status,
      value: count,
    })
  );

  // Personnalisation du tooltip pour les graphiques
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data) {
    return <div>Aucune Data</div>;
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Statistiques de livraison</h2>

        {/* Graphiques */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Répartition par statut */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Répartition par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[entry.name] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(data?.statusCount || {})?.map(
                  ([status, count]) => (
                    <Badge
                      key={status}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: STATUS_COLORS[status] || "#888",
                        }}
                      />
                      {status}: {String(count)}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Évolution quotidienne */}
          <Card className="col-span-1 ">
            <CardHeader>
              <CardTitle>Évolution quotidienne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.periodStats.daily}
                    margin={{
                      top: 5,
                      right: -20,
                      left: -20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), "dd/MM")}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="count"
                      name="Livraisons"
                      stroke="#0088FE"
                      fill="#0088FE"
                      fillOpacity={0.3}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="amount"
                      name="Montant ($)"
                      stroke="#00C49F"
                      fill="#00C49F"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Évolution mensuelle */}
        <Card className="-px-10">
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.periodStats.monthly}
                  margin={{
                    top: 5,
                    right: -20,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(month) =>
                      format(new Date(month + "-01"), "MMM yyyy", {
                        locale: fr,
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" name="Livraisons" fill="#0088FE" />
                  <Bar dataKey="amount" name="Montant ($)" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Liste des livraisons récentes */}
        <MotionCard variants={chartVariants} className="border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Livraisons récentes</CardTitle>
            <Button size="sm" className="text-xs" asChild>
              <Link href="/admin/deliveries">
                Voir plus
                <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <motion.div className="space-y-4">
              {data.recentDeliveries
                .slice(0, 10)
                .map((delivery: any, index: number) => (
                  <motion.div
                    key={delivery.id}
                    className="flex items-center justify-between border-b pb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="bg-primary/10 p-2 rounded-full"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <PackageIcon className="h-5 w-5 text-primary" />
                      </motion.div>
                      <div>
                        <p className="font-medium">
                          #{delivery.trackingNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {delivery.pickupCity} → {delivery.deliveryCity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {delivery.sender.firstName} {delivery.sender.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(delivery.createdAt), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <MotionBadge
                        className={`
                        ${
                          delivery.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : ""
                        } 
                        ${
                          delivery.status === "ACCEPTED"
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        } 
                        ${
                          delivery.status === "RESERVED"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          delivery.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                        ${
                          delivery.status === "PENDING"
                            ? "bg-purple-100 text-purple-800"
                            : ""
                        }
                      `}
                        whileHover={{ scale: 1.05 }}
                      >
                        {delivery.status}
                      </MotionBadge>
                    </div>
                  </motion.div>
                ))}

              {data.recentDeliveries.length === 0 && (
                <motion.div
                  className="text-center py-12 text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Aucune livraison récente
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </MotionCard>
      </div>
    </motion.div>
  );
}
