"use client";

import { useState } from "react";
import { formatMoney } from "@/helpers/utilFunction";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TaxData {
  totalTps: number;
  totalTvq: number;
  totalAmount: number;
}

interface ExpensesEvolutionChartProps {
  title?: string;
  taxes?: {
    monthly: Record<string, TaxData>;
    trimestrial: Record<string, TaxData>;
  };
  defaultCollapsed?: boolean;
}

export function ExpensesEvolutionChart({
  title = "Évolution des dépenses",
  taxes,
  defaultCollapsed = true,
}: ExpensesEvolutionChartProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [showMonthly, setShowMonthly] = useState(false);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // Si aucune donnée n'est fournie, afficher un message ou retourner null
  if (!taxes) {
    return null;
  }

  // Calcul des totaux pour les statistiques et le résumé en mode replié
  const totalMonthly = {
    amount: Object.values(taxes.monthly).reduce(
      (sum, data) => sum + data.totalAmount,
      0
    ),
    tps: Object.values(taxes.monthly).reduce(
      (sum, data) => sum + data.totalTps,
      0
    ),
    tvq: Object.values(taxes.monthly).reduce(
      (sum, data) => sum + data.totalTvq,
      0
    ),
  };

  const totalTrimestrial = {
    amount: Object.values(taxes.trimestrial).reduce(
      (sum, data) => sum + data.totalAmount,
      0
    ),
    tps: Object.values(taxes.trimestrial).reduce(
      (sum, data) => sum + data.totalTps,
      0
    ),
    tvq: Object.values(taxes.trimestrial).reduce(
      (sum, data) => sum + data.totalTvq,
      0
    ),
  };

  // Nombre de périodes
  const periodsCount = {
    monthly: Object.keys(taxes.monthly).length,
    trimestrial: Object.keys(taxes.trimestrial).length,
  };

  // Transformer les données pour le graphique
  const prepareChartData = () => {
    if (showMonthly) {
      return Object.entries(taxes.monthly || {}).map(([month, data]) => ({
        name: month,
        TPS: data.totalTps,
        TVQ: data.totalTvq,
        Total: data.totalAmount,
      }));
    } else {
      return Object.entries(taxes.trimestrial || {}).map(([quarter, data]) => ({
        name: quarter,
        TPS: data.totalTps,
        TVQ: data.totalTvq,
        Total: data.totalAmount,
      }));
    }
  };

  const chartData = prepareChartData();

  return (
    <Card className="mt-5 mb-24">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {title} {showMonthly ? "Mensuelle" : "Trimestrielle"}
          </CardTitle>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {/* Résumé en mode replié */}
        {isCollapsed && (
          <div className="grid lg:grid-cols-4 gap-2 mt-2 text-sm">
            <div>
              <span className="text-gray-500">Total dépenses:</span>{" "}
              <span className="font-medium text-orange-600">
                {formatMoney(
                  showMonthly ? totalMonthly.amount : totalTrimestrial.amount
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Périodes:</span>{" "}
              <span className="font-medium">
                {showMonthly ? periodsCount.monthly : periodsCount.trimestrial}
              </span>
            </div>
            <div>
              <span className="text-gray-500">TPS:</span>{" "}
              <span className="font-medium text-blue-600">
                {formatMoney(
                  showMonthly ? totalMonthly.tps : totalTrimestrial.tps
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-500">TVQ:</span>{" "}
              <span className="font-medium text-green-600">
                {formatMoney(
                  showMonthly ? totalMonthly.tvq : totalTrimestrial.tvq
                )}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <div className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span
                  className={
                    !showMonthly
                      ? "font-semibold text-orange-600"
                      : "text-gray-500"
                  }
                >
                  Trimestrielle
                </span>
                <Switch checked={showMonthly} onChange={setShowMonthly} />
                <span
                  className={
                    showMonthly
                      ? "font-semibold text-orange-600"
                      : "text-gray-500"
                  }
                >
                  Mensuelle
                </span>
              </div>

              <div className="flex justify-end">
                <Tabs
                  defaultValue="area"
                  value={chartType}
                  onValueChange={(value) =>
                    setChartType(value as "area" | "bar")
                  }
                  className="w-[200px]"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="area">Aires</TabsTrigger>
                    <TabsTrigger value="bar">Barres</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) =>
                      value > 1000 ? `${(value / 1000).toFixed(1)}k` : value
                    }
                    domain={[
                      "dataMin",
                      (dataMax: number) => Math.ceil(dataMax * 1.1),
                    ]}
                  />
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value))}
                    labelFormatter={(label) =>
                      `${showMonthly ? "Mois" : "Trimestre"}: ${label}`
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Total"
                    stroke="#ff7300"
                    fill="#ff7300"
                    fillOpacity={0.7}
                    strokeWidth={1}
                  />
                  <Area
                    type="monotone"
                    dataKey="TVQ"
                    stroke="#2de875"
                    fill="#2de875"
                    fillOpacity={0.7}
                    strokeWidth={1}
                  />
                  <Area
                    type="monotone"
                    dataKey="TPS"
                    stroke="#2c22e0"
                    fill="#2c22e0"
                    fillOpacity={0.7}
                    strokeWidth={1}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) =>
                      value > 1000 ? `${(value / 1000).toFixed(1)}k` : value
                    }
                    domain={[
                      "dataMin",
                      (dataMax: number) => Math.ceil(dataMax * 1.1),
                    ]}
                  />
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value))}
                    labelFormatter={(label) =>
                      `${showMonthly ? "Mois" : "Trimestre"}: ${label}`
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="Total"
                    fill="#ff7300"
                    fillOpacity={0.7}
                    stroke="#ff7300"
                    strokeWidth={1}
                  />
                  <Bar
                    dataKey="TVQ"
                    fill="#2de875"
                    fillOpacity={0.7}
                    stroke="#2de875"
                    strokeWidth={1}
                  />
                  <Bar
                    dataKey="TPS"
                    fill="#2c22e0"
                    fillOpacity={0.7}
                    stroke="#2c22e0"
                    strokeWidth={1}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Résumé des statistiques */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total des dépenses</p>
              <p className="text-xl font-bold text-orange-600">
                {formatMoney(
                  showMonthly ? totalMonthly.amount : totalTrimestrial.amount
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">TPS totale</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatMoney(
                  showMonthly ? totalMonthly.tps : totalTrimestrial.tps
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">TVQ totale</p>
              <p className="text-lg font-semibold text-green-600">
                {formatMoney(
                  showMonthly ? totalMonthly.tvq : totalTrimestrial.tvq
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
