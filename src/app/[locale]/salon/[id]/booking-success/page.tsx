"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

export default function SalonBookingSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "fr";
  const salonId = params.id as string;
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-600" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Paiement en cours de traitement
        </h1>
        <p className="text-slate-600">
          Merci ! Si le paiement est confirmé, vous recevrez une confirmation
          par email. Vous pouvez aussi suivre vos rendez-vous dans
          l&apos;application korí.
        </p>
        {sessionId && (
          <p className="text-xs text-slate-400 break-all">
            Référence : {sessionId}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild variant="default">
            <Link href={`/${locale}/salon/${salonId}`}>
              Retour au salon
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${locale}/download-app`}>Télécharger l&apos;app</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
