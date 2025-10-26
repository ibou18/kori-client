/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "antd";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { requestWrapper } from "@/config/requestsConfig";
interface StripePrice {
  id: string;
  currency: string;
  unit_amount: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
}

interface StripePlan {
  id: string;
  amount: number;
  currency: string;
  interval: string;
  product: string;
}

interface StripeSubscription {
  status: string;
  endDateTimestamp: number;
  endDate: string;
  plan: StripePlan;
  price: StripePrice;
  subscriptionId: string;
}

interface SubscriptionDetailsProps {
  subscription: StripeSubscription;
  loading: boolean;
  error: string | null;
}

export default function SubscriptionDetails({
  subscription,
  loading,
  error,
}: SubscriptionDetailsProps) {
  const handlePortalAccess = async () => {
    try {
      const response = await requestWrapper.get(`/subscriptions/portal`);
      if (response?.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Erreur lors de l'accès au portail:", error);
    }
  };

  if (loading) return <div>Chargement des détails de l'abonnement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!subscription) return <div>Aucun abonnement actif trouvé</div>;

  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2}>
              <div className="flex justify-between items-center">
                <Typography className="text-lg font-bold">
                  Détails de l'abonnement
                </Typography>
                <Badge
                  variant={
                    subscription.status === "active" ? "default" : "destructive"
                  }
                >
                  {subscription.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Status</TableCell>
            <TableCell>
              {subscription.status === "active" ? "Actif" : "Inactif"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Date de fin</TableCell>
            <TableCell>{formatDate(subscription.endDate)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Montant</TableCell>
            <TableCell>
              {formatAmount(subscription.price.unit_amount)}{" "}
              {subscription.price.currency.toUpperCase()} /{" "}
              {subscription.price.recurring.interval}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Type d'abonnement</TableCell>
            <TableCell>
              {subscription.price.recurring.interval === "year"
                ? "Annuel"
                : "Mensuel"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">N° Subscription</TableCell>
            <TableCell className="italic font-bold">
              {subscription.subscriptionId}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="default" onClick={handlePortalAccess}>
          Gérer l'abonnement
        </Button>
      </div>
    </Card>
  );
}
