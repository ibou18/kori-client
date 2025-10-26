"use client";

import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTransefers } from "@/app/data/hooksHop";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Transfer {
  id: string;
  amount: number;
  currency: string;
  description: string;
  destination: string;
  created: number;
  metadata: {
    deliveryIds: string;
    platform: string;
    travelerId: string;
    tripId: string;
  };
}

export default function TransfersPage() {
  const { data: transfers, isLoading, isError } = useGetTransefers();
  const [acceptedTransfers, setAcceptedTransfers] = useState<string[]>([]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convertir les secondes en millisecondes
    return format(date, "dd MMM yyyy à HH:mm", { locale: fr });
  };

  const handleAcceptTransfer = (transferId: string) => {
    // TODO: Implement the logic to accept the transfer
    // This could involve calling an API to update the transfer status
    console.log(`Transfer accepted: ${transferId}`);
    setAcceptedTransfers([...acceptedTransfers, transferId]);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-5">Transferts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-3/4" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-1/2" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !transfers) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-5">Transferts</h1>
        <div className="text-red-500">
          Erreur lors du chargement des transferts.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Transferts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-6">
        {transfers.data.map((transfer: Transfer) => (
          <Card key={transfer.id}>
            <CardHeader>
              <CardTitle>{transfer.description}</CardTitle>
              <CardDescription>
                Date: {formatDate(transfer.created)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Montant:{" "}
                {formatCurrency({
                  amount: transfer.amount / 100,
                  currency: (["CAD", "USD", "EUR"].includes(transfer.currency)
                    ? transfer.currency
                    : "CAD") as "CAD" | "USD" | "EUR",
                })}
              </p>
              <p>Destination: {transfer.destination}</p>
              <p>
                Voyageur ID:{" "}
                {transfer.metadata.travelerId.replace(
                  /^(.)(.*)(.)$/,
                  "$1***$3"
                )}
              </p>
              <p>Livraisons: {transfer.metadata.deliveryIds}</p>
              {/* <Button
                onClick={() => handleAcceptTransfer(transfer.id)}
                disabled={acceptedTransfers.includes(transfer.id)}
              >
                {acceptedTransfers.includes(transfer.id)
                  ? "Accepté"
                  : "Accepter"}
              </Button> */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
