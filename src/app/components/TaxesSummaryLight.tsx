import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, BarChart2, PieChart } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TaxesSummaryLightProps {
  receipts: {
    monthly: Record<string, { totalAmount: number }>;
    trimestrial: Record<string, { totalAmount: number }>;
  };
  invoices: {
    monthly: Array<{ period: string; amount: number }>;
    quarterly: Array<{ period: string; amount: number }>;
  };
}

type ChartType = "donut" | "bar" | "none";

export function TaxesSummaryLight({
  receipts,
  invoices,
}: TaxesSummaryLightProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [chartType, setChartType] = useState<ChartType>("none");
  const [currentPeriod, setCurrentPeriod] = useState<string | null>(null);

  // Tri et limitation des périodes mensuelles
  const sortedMonthly = [...invoices.monthly]
    .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())
    .slice(0, 5);

  // Tri et limitation des périodes trimestrielles
  const sortedQuarterly = [...invoices.quarterly]
    .sort((a, b) => {
      const [yearA, quarterA] = a.period.split("-Q");
      const [yearB, quarterB] = b.period.split("-Q");
      return yearB + quarterB > yearA + quarterA ? 1 : -1;
    })
    .slice(0, 5);

  // Fonction pour formater la date mensuelle
  const formatMonthPeriod = (period: string) => {
    const date = new Date(period);
    return new Intl.DateTimeFormat("fr", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Fonction pour formater un trimestre
  const formatQuarterPeriod = (period: string) => {
    const [year, quarter] = period.split("-Q");
    return `${year} - T${quarter}`;
  };

  // Fonction pour préparer les données du graphique
  const prepareChartData = (period: string, isMonthly: boolean) => {
    const revenue = isMonthly
      ? invoices.monthly.find((m) => m.period === period)?.amount || 0
      : invoices.quarterly.find((q) => q.period === period)?.amount || 0;

    const expense = isMonthly
      ? receipts.monthly[period]?.totalAmount || 0
      : receipts.trimestrial[period]?.totalAmount || 0;

    const profit = revenue - expense;

    return [
      { name: "Revenus", value: revenue, color: "#10b981" },
      { name: "Dépenses", value: expense, color: "#ef4444" },
      { name: "Profit", value: profit, color: "#6366f1" },
    ];
  };

  // Fonction pour afficher/cacher le graphique pour une période spécifique
  const toggleChart = (period: string, type: ChartType) => {
    if (currentPeriod === period && chartType === type) {
      setChartType("none");
      setCurrentPeriod(null);
    } else {
      setChartType(type);
      setCurrentPeriod(period);
    }
  };

  const COLORS = ["#10b981", "#ef4444", "#6366f1"];

  const calculateSummary = () => {
    const totalRevenue = {
      monthly: invoices.monthly.reduce((sum, item) => sum + item.amount, 0),
      quarterly: invoices.quarterly.reduce((sum, item) => sum + item.amount, 0),
    };

    const totalExpenses = {
      monthly: Object.values(receipts.monthly).reduce(
        (sum, item) => sum + item.totalAmount,
        0
      ),
      quarterly: Object.values(receipts.trimestrial).reduce(
        (sum, item) => sum + item.totalAmount,
        0
      ),
    };

    const totalProfit = {
      monthly: totalRevenue.monthly - totalExpenses.monthly,
      quarterly: totalRevenue.quarterly - totalExpenses.quarterly,
    };

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalProfit,
    };
  };

  const summaryData = calculateSummary();

  const collapsedSummary = {
    revenue: summaryData.revenue.quarterly,
    expenses: summaryData.expenses.quarterly,
    profit: summaryData.profit.quarterly,
    periods: invoices.quarterly.length,
  };

  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Aperçu financier</CardTitle>
            <span className="text-sm text-muted-foreground">
              (5 dernières périodes)
            </span>
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {isCollapsed && (
          <div className="grid lg:grid-cols-4 gap-4 mt-3 text-sm">
            <div className="space-y-1">
              <p className="text-gray-500">Revenus (trim.)</p>
              <p className="text-base font-medium text-green-600">
                {formatCurrency({
                  amount: collapsedSummary.revenue,
                  currency: "CAD",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Dépenses (trim.)</p>
              <p className="text-base font-medium text-red-500">
                {formatCurrency({
                  amount: collapsedSummary.expenses,
                  currency: "CAD",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Profit (trim.)</p>
              <p
                className={`text-base font-medium ${
                  collapsedSummary.profit >= 0
                    ? "text-blue-600"
                    : "text-red-500"
                }`}
              >
                {formatCurrency({
                  amount: collapsedSummary.profit,
                  currency: "CAD",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Périodes</p>
              <p className="text-base font-medium">
                {collapsedSummary.periods} trimestre(s)
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="mb-5">
              <TabsTrigger value="monthly">Mensuel</TabsTrigger>
              <TabsTrigger value="quarterly">Trimestriel</TabsTrigger>
            </TabsList>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Résumé global
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="lg:text-sm text-xs text-gray-500">
                    Revenus mensuels
                  </p>
                  <p className="text-base font-semibold text-green-600">
                    {formatCurrency({
                      amount: summaryData.revenue.monthly,
                      currency: "CAD",
                    })}
                  </p>
                </div>
                <div>
                  <p className="lg:text-sm text-xs text-gray-500">
                    Revenus trimestriels
                  </p>
                  <p className="text-base font-semibold text-green-600">
                    {formatCurrency({
                      amount: summaryData.revenue.quarterly,
                      currency: "CAD",
                    })}
                  </p>
                </div>
                <div>
                  <p className="lg:text-sm text-xs text-gray-500">
                    Dépenses mensuelles
                  </p>
                  <p className="text-base font-semibold text-red-500">
                    {formatCurrency({
                      amount: summaryData.expenses.monthly,
                      currency: "CAD",
                    })}
                  </p>
                </div>
                <div>
                  <p className="lg:text-sm text-xs text-gray-500">
                    Dépenses trimestrielles
                  </p>
                  <p className="text-base font-semibold text-red-500">
                    {formatCurrency({
                      amount: summaryData.expenses.quarterly,
                      currency: "CAD",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <TabsContent value="monthly">
              <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                {sortedMonthly.map((month) => (
                  <div
                    key={month.period}
                    className="border bg-white rounded-lg hover:bg-gray-50 transition-colors overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-4 p-4">
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {formatMonthPeriod(month.period)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revenus</p>
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency({
                            amount: month.amount,
                            currency: "CAD",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Dépenses
                        </p>
                        <p className="text-sm font-medium text-red-500">
                          {formatCurrency({
                            amount:
                              receipts.monthly[month.period]?.totalAmount || 0,
                            currency: "CAD",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-1 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={
                          currentPeriod === month.period &&
                          chartType === "donut"
                            ? "default"
                            : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChart(month.period, "donut");
                        }}
                      >
                        <PieChart className="h-4 w-4 mr-1" />
                        Donut
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          currentPeriod === month.period && chartType === "bar"
                            ? "default"
                            : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChart(month.period, "bar");
                        }}
                      >
                        <BarChart2 className="h-4 w-4 mr-1" />
                        Barres
                      </Button>
                    </div>

                    {currentPeriod === month.period && chartType !== "none" && (
                      <div className="h-[300px] mt-2 p-4 border-t">
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === "donut" ? (
                            <RechartsPieChart>
                              <Pie
                                data={prepareChartData(month.period, true)}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                {prepareChartData(month.period, true).map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency({
                                    amount: Number(value),
                                    currency: "CAD",
                                  })
                                }
                              />
                              <Legend />
                            </RechartsPieChart>
                          ) : (
                            <BarChart
                              data={prepareChartData(month.period, true)}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <XAxis dataKey="name" />
                              <YAxis
                                tickFormatter={(value) =>
                                  value > 1000
                                    ? `${(value / 1000).toFixed(1)}k`
                                    : value
                                }
                              />
                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency({
                                    amount: Number(value),
                                    currency: "CAD",
                                  })
                                }
                              />
                              <Legend />
                              <Bar dataKey="value">
                                {prepareChartData(month.period, true).map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  )
                                )}
                              </Bar>
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quarterly">
              <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                {sortedQuarterly.map((quarter) => (
                  <div
                    key={quarter.period}
                    className="border bg-white rounded-lg hover:bg-gray-50 transition-colors overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-4 p-4">
                      <div>
                        <p className="text-sm font-medium">
                          {formatQuarterPeriod(quarter.period)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revenus</p>
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency({
                            amount: quarter.amount,
                            currency: "CAD",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Dépenses
                        </p>
                        <p className="text-sm font-medium text-red-500">
                          {formatCurrency({
                            amount:
                              receipts.trimestrial[quarter.period]
                                ?.totalAmount || 0,
                            currency: "CAD",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-1 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={
                          currentPeriod === quarter.period &&
                          chartType === "donut"
                            ? "default"
                            : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChart(quarter.period, "donut");
                        }}
                      >
                        <PieChart className="h-4 w-4 mr-1" />
                        Donut
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          currentPeriod === quarter.period &&
                          chartType === "bar"
                            ? "default"
                            : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChart(quarter.period, "bar");
                        }}
                      >
                        <BarChart2 className="h-4 w-4 mr-1" />
                        Barres
                      </Button>
                    </div>

                    {currentPeriod === quarter.period &&
                      chartType !== "none" && (
                        <div className="h-[300px] mt-2 p-4 border-t">
                          <ResponsiveContainer width="100%" height="100%">
                            {chartType === "donut" ? (
                              <RechartsPieChart>
                                <Pie
                                  data={prepareChartData(quarter.period, false)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  paddingAngle={5}
                                  dataKey="value"
                                  label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {prepareChartData(quarter.period, false).map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                      />
                                    )
                                  )}
                                </Pie>
                                <Tooltip
                                  formatter={(value) =>
                                    formatCurrency({
                                      amount: Number(value),
                                      currency: "CAD",
                                    })
                                  }
                                />
                                <Legend />
                              </RechartsPieChart>
                            ) : (
                              <BarChart
                                data={prepareChartData(quarter.period, false)}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <XAxis dataKey="name" />
                                <YAxis
                                  tickFormatter={(value) =>
                                    value > 1000
                                      ? `${(value / 1000).toFixed(1)}k`
                                      : value
                                  }
                                />
                                <Tooltip
                                  formatter={(value) =>
                                    formatCurrency({
                                      amount: Number(value),
                                      currency: "CAD",
                                    })
                                  }
                                />
                                <Legend />
                                <Bar dataKey="value">
                                  {prepareChartData(quarter.period, false).map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                      />
                                    )
                                  )}
                                </Bar>
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
