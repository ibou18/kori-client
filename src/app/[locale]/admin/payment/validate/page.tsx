"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  useGetDeliveryById,
  useGetTrip,
  useVerifyPaymentKeyAndPayTraveler,
} from "@/app/data/hooksHop";
import PaymentTraveler from "./components/PaymentTraveler";

export default function PaymentValidationPage() {
  // Récupération des paramètres d'URL
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId") as string;
  const deliveryId = searchParams.get("deliveryId") as string;

  return (
    <div className="container max-w-md mx-auto py-12">
      <PaymentTraveler tripId={tripId} deliveryId={deliveryId} />
    </div>
  );
}
