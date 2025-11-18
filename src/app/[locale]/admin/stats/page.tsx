"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  useGetAdminStats,
  useGetRevenueEvolution,
  useGetTopSalons,
  useGetTopServices,
} from "@/app/data/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DateRange = "7days" | "month" | "3months" | "6months" | "year" | "custom";

export default function StatsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const getDateRange = (range: DateRange) => {
    const today = dayjs();
    let startDate: dayjs.Dayjs;
    const endDate: dayjs.Dayjs = today;

    switch (range) {
      case "7days":
        startDate = today.subtract(7, "days");
        break;
      case "month":
        startDate = today.startOf("month");
        break;
      case "3months":
        startDate = today.subtract(3, "months");
        break;
      case "6months":
        startDate = today.subtract(6, "months");
        break;
      case "year":
        startDate = today.startOf("year");
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          return {
            startDate: dayjs(customStartDate).format("YYYY-MM-DD"),
            endDate: dayjs(customEndDate).format("YYYY-MM-DD"),
          };
        }
        return null;
      default:
        startDate = today.subtract(7, "days");
    }

    return {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
    };
  };

  const dateParams = getDateRange(dateRange);
  const router = useRouter();

  const { data: statsData, isLoading } = useGetAdminStats(
    dateParams || undefined
  );
  const { data: topServicesData } = useGetTopServices(
    dateParams ? { ...dateParams, limit: 10 } : undefined
  );
  const { data: topSalonsData } = useGetTopSalons(
    dateParams ? { ...dateParams, limit: 10 } : undefined
  );
  const { data: evolutionData } = useGetRevenueEvolution(
    dateParams || undefined
  );

  const stats = statsData?.data || statsData;
  const topServices = topServicesData?.data || topServicesData || [];
  const topSalons = topSalonsData?.data || topSalonsData || [];
  const evolution = evolutionData?.data || evolutionData || [];
  console.log("topSalons", topSalons);
  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: string;
    subtitle?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <PageWrapper
      title="Statistiques"
      description="Analyse de la performance de la plateforme"
    >
      <div className="space-y-6">
        {/* Sélection de la plage de dates */}
        <Card>
          <CardHeader>
            <CardTitle>Période d'analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select
                  value={dateRange}
                  onValueChange={(v: string) => setDateRange(v as DateRange)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 derniers jours</SelectItem>
                    <SelectItem value="month">Mois en cours</SelectItem>
                    <SelectItem value="3months">3 derniers mois</SelectItem>
                    <SelectItem value="6months">6 derniers mois</SelectItem>
                    <SelectItem value="year">Année en cours</SelectItem>
                    <SelectItem value="custom">
                      Période personnalisée
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {dateRange === "custom" && (
                <div className="flex gap-2 flex-1">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  />
                </div>
              )}
              {dateParams && (
                <div className="text-sm text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dayjs(dateParams.startDate).format("DD MMM YYYY")} -{" "}
                  {dayjs(dateParams.endDate).format("DD MMM YYYY")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Statistiques revenus */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenus
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  title="Revenus totaux"
                  value={`${(stats.revenue?.total || 0).toLocaleString(
                    "fr-CA",
                    {
                      style: "currency",
                      currency: "CAD",
                    }
                  )}`}
                  icon={DollarSign}
                />
                <StatCard
                  title="Revenus de la période"
                  value={`${(stats.revenue?.inPeriod || 0).toLocaleString(
                    "fr-CA",
                    {
                      style: "currency",
                      currency: "CAD",
                    }
                  )}`}
                  icon={TrendingUp}
                  subtitle={
                    dateParams
                      ? `Du ${dayjs(dateParams.startDate).format(
                          "DD MMM"
                        )} au ${dayjs(dateParams.endDate).format("DD MMM")}`
                      : ""
                  }
                />
              </div>
            </div>

            {/* Graphique d'évolution du chiffre d'affaires */}
            {evolution.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Évolution du chiffre d'affaires
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Graphique en aires pour le CA */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Chiffre d'affaires
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={evolution}>
                            <defs>
                              <linearGradient
                                id="colorRevenue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#53745D"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#53745D"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(value) => {
                                if (value.includes("-")) {
                                  return dayjs(value).format("DD MMM");
                                }
                                return value;
                              }}
                            />
                            <YAxis
                              tickFormatter={(value) =>
                                `$${value.toLocaleString("fr-CA")}`
                              }
                            />
                            <Tooltip
                              formatter={(value: any) => [
                                `${Number(value).toLocaleString("fr-CA", {
                                  style: "currency",
                                  currency: "CAD",
                                })}`,
                                "Chiffre d'affaires",
                              ]}
                              labelFormatter={(value) =>
                                dayjs(value).format("DD MMM YYYY")
                              }
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#53745D"
                              strokeWidth={3}
                              fill="url(#colorRevenue)"
                              name="Chiffre d'affaires (CAD)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Statistiques résumées */}
                      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Total CA</p>
                          <p className="text-lg font-semibold text-[#53745D]">
                            {evolution
                              .reduce(
                                (sum: number, item: any) =>
                                  sum + (item.revenue || 0),
                                0
                              )
                              .toLocaleString("fr-CA", {
                                style: "currency",
                                currency: "CAD",
                              })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Moyenne/jour</p>
                          <p className="text-lg font-semibold">
                            {evolution.length > 0
                              ? (
                                  evolution.reduce(
                                    (sum: number, item: any) =>
                                      sum + (item.revenue || 0),
                                    0
                                  ) / evolution.length
                                ).toLocaleString("fr-CA", {
                                  style: "currency",
                                  currency: "CAD",
                                })
                              : "$0.00"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pic</p>
                          <p className="text-lg font-semibold">
                            {Math.max(
                              ...evolution.map((item: any) => item.revenue || 0)
                            ).toLocaleString("fr-CA", {
                              style: "currency",
                              currency: "CAD",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Graphique des réservations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Nombre de réservations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={evolution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(value) => {
                                if (value.includes("-")) {
                                  return dayjs(value).format("DD MMM");
                                }
                                return value;
                              }}
                            />
                            <YAxis />
                            <Tooltip
                              formatter={(value: any) => [
                                value,
                                "Réservations",
                              ]}
                              labelFormatter={(value) =>
                                dayjs(value).format("DD MMM YYYY")
                              }
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="bookings"
                              stroke="#8884d8"
                              strokeWidth={3}
                              name="Réservations"
                              dot={{ r: 5 }}
                              activeDot={{ r: 7 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Statistiques résumées */}
                      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-lg font-semibold text-[#8884d8]">
                            {evolution
                              .reduce(
                                (sum: number, item: any) =>
                                  sum + (item.bookings || 0),
                                0
                              )
                              .toLocaleString("fr-CA")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Moyenne/jour</p>
                          <p className="text-lg font-semibold">
                            {evolution.length > 0
                              ? Math.round(
                                  evolution.reduce(
                                    (sum: number, item: any) =>
                                      sum + (item.bookings || 0),
                                    0
                                  ) / evolution.length
                                )
                              : 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pic</p>
                          <p className="text-lg font-semibold">
                            {Math.max(
                              ...evolution.map(
                                (item: any) => item.bookings || 0
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Services les plus commandés */}
            {topServices.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Services les plus commandés
                </h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topServices}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="serviceName"
                            type="category"
                            width={150}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(value: any, name: string) => {
                              if (name === "revenue") {
                                return [
                                  `${Number(value).toLocaleString("fr-CA", {
                                    style: "currency",
                                    currency: "CAD",
                                  })}`,
                                  "Revenus",
                                ];
                              }
                              return [value, "Réservations"];
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="bookings"
                            fill="#53745D"
                            name="Nombre de réservations"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {topServices
                        .slice(0, 5)
                        .map((service: any, index: number) => (
                          <div
                            key={service.serviceId}
                            className="flex items-center justify-between p-2 border rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-gray-400">
                                #{index + 1}
                              </span>
                              <span className="font-medium">
                                {service.serviceName}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                {service.bookings} réservations
                              </span>
                              <span className="text-sm font-semibold text-[#53745D]">
                                {service.revenue.toLocaleString("fr-CA", {
                                  style: "currency",
                                  currency: "CAD",
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top salons par revenus */}
            {topSalons.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Top salons par revenus
                </h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topSalons}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="salonName"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            tickFormatter={(value) =>
                              `$${value.toLocaleString("fr-CA")}`
                            }
                          />
                          <Tooltip
                            formatter={(value: any, name: string) => {
                              if (name === "revenue") {
                                return [
                                  `${Number(value).toLocaleString("fr-CA", {
                                    style: "currency",
                                    currency: "CAD",
                                  })}`,
                                  "Revenus",
                                ];
                              }
                              return [value, "Réservations"];
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="revenue"
                            fill="#53745D"
                            name="Revenus (CAD)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {topSalons
                        .slice(0, 5)
                        .map((salon: any, index: number) => (
                          <div
                            key={salon.salonId}
                            className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              router.push(`/admin/salons/${salon.salonId}`)
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-gray-400">
                                #{index + 1}
                              </span>
                              <span className="font-medium">
                                {salon.salonName}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                {salon.bookings} réservations
                              </span>
                              <span className="text-sm font-semibold text-[#53745D]">
                                {salon.revenue.toLocaleString("fr-CA", {
                                  style: "currency",
                                  currency: "CAD",
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Statistiques utilisateurs */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Utilisateurs
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total utilisateurs"
                  value={stats.users?.total || 0}
                  icon={Users}
                />
                <StatCard
                  title="Clients"
                  value={stats.users?.clients || 0}
                  icon={Users}
                  subtitle={`${
                    stats.users?.total
                      ? (
                          (stats.users.clients / stats.users.total) *
                          100
                        ).toFixed(1)
                      : 0
                  }% du total`}
                />
                <StatCard
                  title="Propriétaires"
                  value={stats.users?.owners || 0}
                  icon={Building2}
                />
                <StatCard
                  title="Employés"
                  value={stats.users?.employees || 0}
                  icon={Users}
                />
                <StatCard
                  title="Actifs"
                  value={stats.users?.active || 0}
                  icon={CheckCircle}
                  subtitle={`${
                    stats.users?.total
                      ? (
                          (stats.users.active / stats.users.total) *
                          100
                        ).toFixed(1)
                      : 0
                  }% du total`}
                />
                <StatCard
                  title="Inactifs"
                  value={stats.users?.inactive || 0}
                  icon={XCircle}
                />
              </div>
            </div>

            {/* Statistiques salons */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Salons
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total salons"
                  value={stats.salons?.total || 0}
                  icon={Building2}
                />
                <StatCard
                  title="Actifs"
                  value={stats.salons?.active || 0}
                  icon={CheckCircle}
                  subtitle={`${
                    stats.salons?.total
                      ? (
                          (stats.salons.active / stats.salons.total) *
                          100
                        ).toFixed(1)
                      : 0
                  }% du total`}
                />
                <StatCard
                  title="Vérifiés"
                  value={stats.salons?.verified || 0}
                  icon={CheckCircle}
                  subtitle={`${
                    stats.salons?.total
                      ? (
                          (stats.salons.verified / stats.salons.total) *
                          100
                        ).toFixed(1)
                      : 0
                  }% du total`}
                />
                <StatCard
                  title="Non vérifiés"
                  value={stats.salons?.unverified || 0}
                  icon={XCircle}
                />
              </div>
            </div>
            {/* Statistiques réservations */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Réservations
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total réservations"
                  value={stats.bookings?.total || 0}
                  icon={Calendar}
                />
                <StatCard
                  title="Dans la période"
                  value={stats.bookings?.inPeriod || 0}
                  icon={Calendar}
                  subtitle={
                    dateParams
                      ? `Du ${dayjs(dateParams.startDate).format(
                          "DD MMM"
                        )} au ${dayjs(dateParams.endDate).format("DD MMM")}`
                      : ""
                  }
                />
                <StatCard
                  title="Complétées"
                  value={stats.bookings?.completed || 0}
                  icon={CheckCircle}
                  subtitle={
                    stats.bookings?.inPeriod
                      ? `${(
                          (stats.bookings.completed / stats.bookings.inPeriod) *
                          100
                        ).toFixed(1)}% de la période`
                      : ""
                  }
                />
                <StatCard
                  title="Annulées"
                  value={stats.bookings?.cancelled || 0}
                  icon={XCircle}
                />
                <StatCard
                  title="En attente"
                  value={stats.bookings?.pending || 0}
                  icon={Clock}
                />
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">
                Aucune statistique disponible
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
