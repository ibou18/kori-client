"use client";

import { useGetCheckoutSession } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

type CheckoutSessionPayload = {
  success?: boolean;
  data?: { status?: string };
};

function getPaymentStatus(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const p = payload as CheckoutSessionPayload;
  return p.data?.status;
}

function BookingSuccessActions({
  locale,
  salonId,
}: {
  locale: string;
  salonId: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
      <Button asChild variant="default">
        <Link href={`/${locale}/salon/${salonId}`}>Retour au salon</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href={`/${locale}/download-app`}>Télécharger l&apos;app</Link>
      </Button>
    </div>
  );
}

export default function SalonBookingSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "fr";
  const salonId = params.id as string;
  const sessionId = searchParams.get("session_id");

  const { data: sessionPayload, isPending, isError } = useGetCheckoutSession(
    sessionId ?? ""
  );

  const paymentStatus = sessionPayload
    ? getPaymentStatus(sessionPayload)
    : undefined;

  const payloadSuccess =
    sessionPayload &&
    typeof sessionPayload === "object" &&
    "success" in sessionPayload
      ? (sessionPayload as CheckoutSessionPayload).success
      : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md w-full text-center space-y-6">
        {!sessionId && (
          <>
            <div className="flex justify-center">
              <AlertCircle
                className="h-16 w-16 text-amber-500"
                aria-hidden
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Lien incomplet
            </h1>
            <p className="text-slate-600">
              La référence de paiement est manquante. Si vous venez de payer,
              vérifiez votre email ou retournez au salon pour le suivi de votre
              réservation.
            </p>
            <BookingSuccessActions locale={locale} salonId={salonId} />
          </>
        )}

        {sessionId && isPending && (
          <>
            <div className="flex justify-center">
              <Loader2
                className="h-16 w-16 text-[#53745D] animate-spin"
                aria-hidden
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Vérification du paiement…
            </h1>
            <p className="text-slate-600">
              Nous confirmons votre transaction auprès de Stripe. Merci de
              patienter quelques secondes.
            </p>
          </>
        )}

        {sessionId && !isPending && isError && (
          <>
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Impossible de vérifier le paiement
            </h1>
            <p className="text-slate-600">
              La session de paiement n&apos;a pas pu être lue. Si un débit
              apparaît sur votre compte, conservez votre preuve et contactez le
              support. Sinon, vous pouvez réessayer depuis la page du salon.
            </p>
            <p className="text-xs text-slate-400 break-all">
              Référence : {sessionId}
            </p>
            <BookingSuccessActions locale={locale} salonId={salonId} />
          </>
        )}

        {sessionId &&
          !isPending &&
          !isError &&
          payloadSuccess === false && (
            <>
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500" aria-hidden />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Vérification impossible
              </h1>
              <p className="text-slate-600">
                La réponse du serveur est incomplète. Réessayez plus tard ou
                retournez au salon.
              </p>
              <BookingSuccessActions locale={locale} salonId={salonId} />
            </>
          )}

        {sessionId &&
          !isPending &&
          !isError &&
          payloadSuccess !== false &&
          (paymentStatus === "paid" ||
            paymentStatus === "no_payment_required") && (
            <>
              <div className="flex justify-center">
                <CheckCircle
                  className="h-16 w-16 text-green-600"
                  aria-hidden
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Paiement confirmé
              </h1>
              <p className="text-slate-600">
                Merci ! Votre acompte a bien été enregistré. Vous recevrez une
                confirmation par email. Vous pouvez aussi suivre vos
                rendez-vous dans l&apos;application korí.
              </p>
              <p className="text-xs text-slate-400 break-all">
                Référence : {sessionId}
              </p>
              <BookingSuccessActions locale={locale} salonId={salonId} />
            </>
          )}

        {sessionId &&
          !isPending &&
          !isError &&
          payloadSuccess !== false &&
          paymentStatus === "unpaid" && (
            <>
              <div className="flex justify-center">
                <AlertCircle
                  className="h-16 w-16 text-amber-500"
                  aria-hidden
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Paiement non confirmé
              </h1>
              <p className="text-slate-600">
                Stripe n&apos;indique pas de paiement réussi pour cette session.
                Si vous avez abandonné le formulaire ou si la carte a été
                refusée, aucun prélèvement ne devrait avoir lieu. Vous pouvez
                reprendre une réservation depuis la page du salon.
              </p>
              <p className="text-xs text-slate-400 break-all">
                Référence : {sessionId}
              </p>
              <BookingSuccessActions locale={locale} salonId={salonId} />
            </>
          )}

        {sessionId &&
          !isPending &&
          !isError &&
          payloadSuccess !== false &&
          paymentStatus !== undefined &&
          paymentStatus !== "unpaid" &&
          paymentStatus !== "paid" &&
          paymentStatus !== "no_payment_required" && (
            <>
              <div className="flex justify-center">
                <AlertCircle
                  className="h-16 w-16 text-amber-500"
                  aria-hidden
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Statut de paiement inattendu
              </h1>
              <p className="text-slate-600">
                Le statut retourné ({paymentStatus}) ne permet pas
                d&apos;afficher une confirmation automatique. En cas de doute,
                vérifiez vos emails ou contactez le support.
              </p>
              <p className="text-xs text-slate-400 break-all">
                Référence : {sessionId}
              </p>
              <BookingSuccessActions locale={locale} salonId={salonId} />
            </>
          )}

        {sessionId &&
          !isPending &&
          !isError &&
          payloadSuccess !== false &&
          paymentStatus === undefined && (
            <>
              <div className="flex justify-center">
                <AlertCircle
                  className="h-16 w-16 text-amber-500"
                  aria-hidden
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Données de session incomplètes
              </h1>
              <p className="text-slate-600">
                Nous n&apos;avons pas pu lire le statut du paiement. Réessayez
                plus tard ou retournez au salon.
              </p>
              <BookingSuccessActions locale={locale} salonId={salonId} />
            </>
          )}
      </div>
    </div>
  );
}
