import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type Features = {
  invoices: boolean;
  expenses: boolean;
  tracking: boolean;
  stripe: boolean;
  reports: boolean;
  api: boolean;
  branding: boolean;
  support: boolean;
  multiCompany: boolean;
};

const pricingPlans: {
  name: string;
  price: { monthly: number; yearly: number };
  users: string;
  features: Features;
}[] = [
  {
    name: "Solo 🏠",
    price: { monthly: 19, yearly: 190 },
    users: "1",
    features: {
      invoices: true,
      expenses: true,
      tracking: true,
      stripe: false,
      reports: false,
      api: false,
      branding: false,
      support: false,
      multiCompany: false,
    },
  },
  {
    name: "Pro 🚀",
    price: { monthly: 39, yearly: 390 },
    users: "Jusqu’à 5",
    features: {
      invoices: true,
      expenses: true,
      tracking: true,
      stripe: true,
      reports: true,
      api: false,
      branding: false,
      support: false,
      multiCompany: false,
    },
  },
  {
    name: "Entreprise 🏢",
    price: { monthly: 69, yearly: 690 },
    users: "Jusqu’à 20",
    features: {
      invoices: true,
      expenses: true,
      tracking: true,
      stripe: true,
      reports: true,
      api: true,
      branding: true,
      support: true,
      multiCompany: false,
    },
  },
  //   {
  //     name: "Comptable 📊",
  //     price: { monthly: 99, yearly: 990 },
  //     users: "Jusqu’à 50 clients",
  //     features: {
  //       invoices: true,
  //       expenses: true,
  //       tracking: true,
  //       stripe: true,
  //       reports: true,
  //       api: true,
  //       branding: true,
  //       support: true,
  //       multiCompany: true,
  //     },
  //   },
];

const featuresList = [
  { key: "invoices", label: "Gestion des factures" },
  { key: "expenses", label: "Gestion des reçus & dépenses" },
  { key: "tracking", label: "Suivi des déplacements" },
  { key: "stripe", label: "Intégration Stripe / Paiements" },
  { key: "reports", label: "Rapports avancés" },
  { key: "api", label: "Accès API & Webhooks" },
  { key: "branding", label: "Espace personnalisé (logo & branding)" },
  { key: "support", label: "Support client prioritaire" },
  { key: "multiCompany", label: "Gestion de plusieurs entreprises" },
];

export default function PricingTable() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-6">Nos Tarifs</h2>

      {/* Cartes des tarifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className="shadow-md border border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold">
                {plan.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold">${plan.price.monthly}/mois</p>
              <p className="text-sm text-gray-500">
                ou {plan.price.yearly}$/an
              </p>
              <p className="mt-2 text-gray-700">👥 {plan.users}</p>
              <Button className="mt-4 w-full">Choisir ce plan</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tableau comparatif des fonctionnalités */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-center">Fonctionnalité</th>
              {pricingPlans.map((plan) => (
                <th key={plan.name} className="p-4 text-center">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featuresList.map((feature) => (
              <tr key={feature.key} className="border-t ">
                <td className="p-4">{feature.label}</td>
                {pricingPlans.map((plan: any) => (
                  <td key={plan.name} className="p-4">
                    {plan.features[feature.key] ? (
                      <Check className="text-green-500 text-right" />
                    ) : (
                      <X className="text-red-500 text-right" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
