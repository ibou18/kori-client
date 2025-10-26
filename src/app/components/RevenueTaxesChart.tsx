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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

type Period = "monthly" | "quarterly";
type ChartType = "area" | "bar";
type TaxData = {
  tps: number;
  tvq: number;
};

interface RevenueData {
  period: string;
  count: number;
  amount: number;
  baseAmount: number;
  taxes: TaxData;
}

interface RevenueTaxesChartProps {
  title?: string;
  data: {
    totalRevenue: number;
    baseAmount: number;
    totalTaxes: TaxData;
    monthly: RevenueData[];
    quarterly: RevenueData[];
  };
  defaultCollapsed?: boolean;
}

export function RevenueTaxesChart({
  title = "Statistiques des Revenus",
  data,
  defaultCollapsed = true,
}: RevenueTaxesChartProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [periodType, setPeriodType] = useState<Period>("quarterly");
  const [chartType, setChartType] = useState<ChartType>("area");

  // Format data for chart
  const formatChartData = () => {
    const sourceData = periodType === "monthly" ? data.monthly : data.quarterly;

    return sourceData.map((item) => {
      // Format period names for better display
      let periodName = item.period;
      if (periodType === "monthly") {
        const date = new Date(item.period + "-01");
        periodName = new Intl.DateTimeFormat("fr-CA", {
          year: "numeric",
          month: "long",
        }).format(date);
      }

      return {
        name: periodName,
        Revenus: item.amount,
        "Montant de base": item.baseAmount,
        TPS: item.taxes.tps,
        TVQ: item.taxes.tvq,
      };
    });
  };

  const chartData = formatChartData();

  return (
    <Card className="mt-5">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {title} {periodType === "monthly" ? "Mensuel" : "Trimestriel"}
          </CardTitle>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {/* Petit aperçu même en mode replié */}
        {isCollapsed && (
          <div className="grid lg:grid-cols-4 gap-2 mt-2 text-sm">
            <div>
              <span className="text-gray-500">Revenu:</span>{" "}
              <span className="font-medium text-orange-600">
                {formatMoney(data.totalRevenue)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Base:</span>{" "}
              <span className="font-medium">
                {formatMoney(data.baseAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">TPS:</span>{" "}
              <span className="font-medium text-blue-600">
                {formatMoney(data.totalTaxes.tps)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">TVQ:</span>{" "}
              <span className="font-medium text-green-600">
                {formatMoney(data.totalTaxes.tvq)}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span
                  className={
                    periodType === "quarterly"
                      ? "font-semibold text-orange-600"
                      : "text-gray-500"
                  }
                >
                  Trimestriel
                </span>
                <Switch
                  checked={periodType === "monthly"}
                  onChange={(checked) =>
                    setPeriodType(checked ? "monthly" : "quarterly")
                  }
                />
                <span
                  className={
                    periodType === "monthly"
                      ? "font-semibold text-orange-600"
                      : "text-gray-500"
                  }
                >
                  Mensuel
                </span>
              </div>

              <div className="flex justify-end">
                <Tabs
                  defaultValue="area"
                  value={chartType}
                  onValueChange={(value) => setChartType(value as ChartType)}
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
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
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
                      `${
                        periodType === "monthly" ? "Mois" : "Trimestre"
                      }: ${label}`
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Revenus"
                    stroke="#ff7300"
                    fill="#ff7300"
                    fillOpacity={0.7}
                    strokeWidth={1}
                  />
                  <Area
                    type="monotone"
                    dataKey="Montant de base"
                    stroke="#8884d8"
                    fill="#8884d8"
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
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
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
                      `${
                        periodType === "monthly" ? "Mois" : "Trimestre"
                      }: ${label}`
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="Revenus"
                    fill="#ff7300"
                    fillOpacity={0.7}
                    stroke="#ff7300"
                    strokeWidth={1}
                  />
                  <Bar
                    dataKey="Montant de base"
                    fill="#8884d8"
                    fillOpacity={0.7}
                    stroke="#8884d8"
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

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Revenu total</p>
              <p className="text-xl font-bold text-orange-600">
                {formatMoney(data.totalRevenue)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Montant de base</p>
              <p className="text-lg font-semibold">
                {formatMoney(data.baseAmount)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">TPS</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatMoney(data.totalTaxes.tps)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">TVQ</p>
              <p className="text-lg font-semibold text-green-600">
                {formatMoney(data.totalTaxes.tvq)}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
