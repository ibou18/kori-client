"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Price {
  id: string;
  amount: number;
  currency: string;
  type: string;
  interval: "month" | "year";
}

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  prices: Price[];
}

interface ProductCardProps {
  product: Product;
  onSelect: (priceId: string) => void;
  isSelected: boolean;
  isLoading: boolean;
}

export default function ProductCard({
  product,
  onSelect,
  isSelected,
  isLoading,
}: ProductCardProps) {
  const [selectedInterval, setSelectedInterval] = useState<"month" | "year">(
    "month"
  );
  const monthlyPrice = product.prices.find((p) => p.interval === "month");
  const yearlyPrice = product.prices.find((p) => p.interval === "year");
  const currentPrice =
    selectedInterval === "month" ? monthlyPrice : yearlyPrice;
  const isPro = product.name === "Pro";

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        isSelected ? "border-primary border-2" : "",
        isPro ? "bg-gradient-to-b from-primary/5 to-transparent" : ""
      )}
    >
      {isPro && (
        <div className="absolute -right-12 top-4 rotate-45 bg-primary px-12 py-1">
          <span className="text-xs font-semibold text-white">POPULAIRE</span>
        </div>
      )}

      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold">
                {product.name}
              </CardTitle>
              {isPro && <Sparkles className="h-5 w-5 text-yellow-500" />}
            </div>
            <CardDescription className="text-base">
              {product.description}
            </CardDescription>
          </div>
          <Badge
            variant={isPro ? "default" : "secondary"}
            className="px-3 py-1"
          >
            {product.name}
          </Badge>
        </div>

        <div className="pt-4">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-4xl font-bold">
              {currentPrice && formatPrice(currentPrice.amount)}
            </span>
            <span className="text-sm text-muted-foreground">
              par {selectedInterval === "month" ? "mois" : "an"}
            </span>
            {selectedInterval === "year" && (
              <Badge variant="success" className="bg-green-100 text-green-700">
                Économisez 15%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
          <Button
            variant={selectedInterval === "month" ? "default" : "outline"}
            onClick={() => setSelectedInterval("month")}
            className="flex-1 py-6"
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="font-semibold">Mensuel</span>
              <span className="text-sm">
                {monthlyPrice && formatPrice(monthlyPrice.amount)}/mois
              </span>
            </div>
          </Button>

          <Button
            variant={selectedInterval === "year" ? "default" : "outline"}
            onClick={() => setSelectedInterval("year")}
            className="flex-1 py-6"
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="font-semibold">Annuel</span>
              <span className="text-sm">
                {yearlyPrice && formatPrice(yearlyPrice.amount / 12)}/mois
              </span>
              {/* <span className="text-xs text-green-600 font-medium">
                Économisez 15%
              </span> */}
            </div>
          </Button>
        </div>

        <Button
          className={cn(
            "w-full py-6 text-lg transition-all",
            isPro ? "bg-primary hover:bg-primary/90" : ""
          )}
          onClick={() => currentPrice && onSelect(currentPrice.id)}
          disabled={isLoading || !currentPrice}
          variant={isSelected ? "secondary" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              {isSelected ? <Check className="mr-2 h-5 w-5" /> : null}
              Sélectionner {product.name}
            </>
          )}
        </Button>

        <ul className="space-y-3 text-sm text-gray-600">
          {[
            "Essai gratuit de 14 jours",
            "Annulation à tout moment",
            "Support client prioritaire",
            "Mises à jour gratuites",
          ].map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
