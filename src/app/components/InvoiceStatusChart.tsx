"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatMoney } from "@/helpers/utilFunction";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface StatusStats {
  count: number;
  amount: number;
  percentage: number;
}

interface InvoiceStatusData {
  total: number;
  paid: StatusStats;
  unpaid: StatusStats;
  partial: StatusStats;
  draft: StatusStats;
  pending: {
    count: number;
    amount: number;
  };
}

interface InvoiceStatusChartProps {
  title?: string;
  data: InvoiceStatusData;
  defaultCollapsed?: boolean;
}

export function InvoiceStatusChart({
  title = "Statut des Factures",
  data,
  defaultCollapsed = true,
}: InvoiceStatusChartProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const chartData = [
    {
      name: "Payée",
      value: data.paid.amount,
      count: data.paid.count,
      percentage: data.paid.percentage,
      color: "#4ade80",
    },
    {
      name: "Impayée",
      value: data.unpaid.amount,
      count: data.unpaid.count,
      percentage: data.unpaid.percentage,
      color: "#f87171",
    },
    {
      name: "Partielle",
      value: data.partial.amount,
      count: data.partial.count,
      percentage: data.partial.percentage,
      color: "#fbbf24",
    },
    {
      name: "Brouillon",
      value: data.draft.amount,
      count: data.draft.count,
      percentage: data.draft.percentage,
      color: "#94a3b8",
    },
  ].filter((item) => item.value > 0); // Ne montre que les statuts avec des valeurs

  // Calcul des totaux pour l'aperçu en mode replié
  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);
  const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="mt-5">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {/* Aperçu en mode replié */}
        {isCollapsed && (
          <div className="grid lg:grid-cols-3 gap-2 mt-2 text-sm">
            <div>
              <span className="text-gray-500">Total:</span>{" "}
              <span className="font-medium">{data.total} factures</span>
            </div>
            <div>
              <span className="text-gray-500 ">Payées:</span>{" "}
              <span className="font-medium text-green-600">
                {data.paid.count} ({data.paid.percentage}%)
              </span>
            </div>
            <div>
              <span className="text-gray-500 ">Montant impayé:</span>{" "}
              <span className="font-medium text-red-500">
                {formatMoney(data.unpaid.amount)}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent>
          <div className="flex flex-col md:flex-row">
            <div className="h-[300px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value))}
                    labelFormatter={(label) => `Statut: ${label}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 mt-6 md:mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total des factures</p>
                  <p className="text-xl font-bold">{data.total}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">En attente</p>
                  <p className="text-xl font-bold text-amber-500">
                    {data.pending.count}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatMoney(data.pending.amount)}
                  </p>
                </div>
                {chartData.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <p className="text-sm text-gray-500">{item.name}</p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: item.color }}
                    >
                      {item.count}{" "}
                      <span className="text-sm">({item.percentage}%)</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatMoney(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
