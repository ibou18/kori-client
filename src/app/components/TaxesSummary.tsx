import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/utils/formatCurrency";
import { Info } from "lucide-react";

interface TaxesData {
  receipts: {
    total: {
      totalTps: number;
      totalTvq: number;
      totalAmount: number;
    };
    monthly: Record<
      string,
      {
        totalTps: number;
        totalTvq: number;
        totalAmount: number;
      }
    >;
    trimestrial: Record<
      string,
      {
        totalTps: number;
        totalTvq: number;
        totalAmount: number;
      }
    >;
  };
  invoices: {
    totalRevenue: number;
    totalTaxes: {
      tps: number;
      tvq: number;
    };
    monthly: Array<{
      period: string;
      amount: number;
      taxes: {
        tps: number;
        tvq: number;
      };
    }>;
    quarterly: Array<{
      period: string;
      amount: number;
      taxes: {
        tps: number;
        tvq: number;
      };
    }>;
  };
}

export function TaxesSummary({ receipts, invoices }: TaxesData) {
  const [declarationType, setDeclarationType] = useState<
    "monthly" | "quarterly"
  >("monthly");
  const netTpsPayable = invoices.totalTaxes.tps - receipts.total.totalTps;
  const netTvqPayable = invoices.totalTaxes.tvq - receipts.total.totalTvq;

  return (
    <div className="space-y-3">
      <Tabs defaultValue="monthly" className="w-full ">
        <TabsList className="mb-5 ">
          <TabsTrigger
            value="monthly"
            onClick={() => setDeclarationType("monthly")}
          >
            Mensuel
          </TabsTrigger>
          <TabsTrigger
            value="quarterly"
            onClick={() => setDeclarationType("quarterly")}
          >
            Trimestriel
          </TabsTrigger>
        </TabsList>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <CardTitle>Déclaration de taxes</CardTitle>
            </div>
            <CardDescription>
              Montants à déclarer pour la période
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Déclaration TPS */}
              <div className="space-y-4">
                <h3 className="font-semibold">Déclaration TPS (GST)</h3>
                <div className="space-y-2 border-l-2 border-blue-500 pl-4">
                  <div className="flex justify-between">
                    <span className="text-sm">TPS perçue sur ventes</span>
                    <span className="font-medium">
                      {formatCurrency({
                        amount: invoices.totalTaxes.tps,
                        currency: "CAD",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">TPS payée sur achats (CTI)</span>
                    <span className="font-medium text-green-600">
                      -
                      {formatCurrency({
                        amount: receipts.total.totalTps,
                        currency: "CAD",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">
                      Solde à verser (ou à recevoir)
                    </span>
                    <span
                      className={`font-bold ${
                        netTpsPayable > 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {formatCurrency({
                        amount: netTpsPayable,
                        currency: "CAD",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Déclaration TVQ */}
              <div className="space-y-4">
                <h3 className="font-semibold">Déclaration TVQ (QST)</h3>
                <div className="space-y-2 border-l-2 border-blue-500 pl-4">
                  <div className="flex justify-between">
                    <span className="text-sm">TVQ perçue sur ventes</span>
                    <span className="font-medium">
                      {formatCurrency({
                        amount: invoices.totalTaxes.tvq,
                        currency: "CAD",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">TVQ payée sur achats (RTI)</span>
                    <span className="font-medium text-green-600">
                      -
                      {formatCurrency({
                        amount: receipts.total.totalTvq,
                        currency: "CAD",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">
                      Solde à verser (ou à recevoir)
                    </span>
                    <span
                      className={`font-bold ${
                        netTvqPayable > 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {formatCurrency({
                        amount: netTvqPayable,
                        currency: "CAD",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Notes importantes:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• CTI : Crédit de taxe sur les intrants (TPS)</li>
                <li>• RTI : Remboursement de taxe sur les intrants (TVQ)</li>
                <li>• Un montant positif signifie un versement à effectuer</li>
                <li>
                  • Un montant négatif signifie un remboursement à recevoir
                </li>
                <li>
                  •{" "}
                  {declarationType === "monthly"
                    ? "Déclaration mensuelle : à produire avant le 30 du mois suivant"
                    : "Déclaration trimestrielle : à produire avant la fin du mois suivant le trimestre"}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* <Tabs defaultValue="monthly" className="w-full">
        <TabsList>
          <TabsTrigger
            value="monthly"
            onClick={() => setDeclarationType("monthly")}
          >
            Mensuel
          </TabsTrigger>
          <TabsTrigger
            value="quarterly"
            onClick={() => setDeclarationType("quarterly")}
          >
            Trimestriel
          </TabsTrigger>
        </TabsList> */}

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détail mensuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.monthly.map((month) => (
                  <div
                    key={month.period}
                    className="grid grid-cols-4 gap-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">{month.period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        TPS à payer
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency({
                          amount:
                            month.taxes.tps -
                            (receipts.monthly[month.period]?.totalTps || 0),
                          currency: "CAD",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        TVQ à payer
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency({
                          amount:
                            month.taxes.tvq -
                            (receipts.monthly[month.period]?.totalTvq || 0),
                          currency: "CAD",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenus</p>
                      <p className="text-sm font-medium">
                        {formatCurrency({
                          amount: month.amount,
                          currency: "CAD",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détail trimestriel</CardTitle>
              <CardDescription>
                Déclaration trimestrielle de TPS/TVQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.quarterly.map((quarter) => (
                  <div
                    key={quarter.period}
                    className="grid grid-cols-4 gap-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        T{quarter.period.split("-Q")[1]}{" "}
                        {quarter.period.split("-Q")[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        TPS à payer
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency({
                          amount:
                            quarter.taxes.tps -
                            (receipts.trimestrial[quarter.period]?.totalTps ||
                              0),
                          currency: "CAD",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        TVQ à payer
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency({
                          amount:
                            quarter.taxes.tvq -
                            (receipts.trimestrial[quarter.period]?.totalTvq ||
                              0),
                          currency: "CAD",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenus</p>
                      <p className="text-sm font-medium">
                        {formatCurrency({
                          amount: quarter.amount,
                          currency: "CAD",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
