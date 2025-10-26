"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import PageWrapper from "@/app/components/block/PageWrapper";
import { useGetSubscriptionByCSession } from "@/app/data/hooks";
import { CalendarDays, CreditCard, Building2, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const {
    data: subscription,
    isLoading,
    error,
  } = useGetSubscriptionByCSession(sessionId as string);

  // useEffect(() => {
  //   if (!sessionId) {
  //     router.push("/");
  //   }
  // }, [sessionId, router]);

  if (isLoading) {
    return (
      <PageWrapper title="Traitement en cours...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title="Une erreur est survenue"
        buttonTitle="Retour à l'accueil"
        handleClick={() => router.push("/")}
      >
        <div className="mx-auto text-center mt-10">
          <p className="text-red-500">{error.message}</p>
        </div>
      </PageWrapper>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <PageWrapper
      title="Paiement Réussi ! 🎉"
      buttonTitle="Retour à l'accueil"
      handleClick={() => router.push("/admin/dashboard")}
    >
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* En-tête avec statut */}
              <div className="text-center pb-6 border-b">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700">
                  <span className="font-medium">Abonnement actif</span>
                </div>
              </div>

              {/* Détails du plan */}
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Informations sur le plan */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Plan & Tarification
                    </h3>
                    <p className="text-2xl font-bold">
                      {subscription.plan.name}
                    </p>
                    <p className="text-gray-600">
                      {formatPrice(
                        subscription.plan.amount,
                        subscription.plan.currency
                      )}{" "}
                      / {subscription.plan.interval}
                    </p>
                  </div>

                  {/* Dates de l'abonnement */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Période d&apos;abonnement
                    </h3>
                    <p>Du {formatDate(subscription.currentPeriodStart)}</p>
                    <p>Au {formatDate(subscription.currentPeriodEnd)}</p>
                  </div>
                </div>

                {/* Informations de l'entreprise */}
                <div className="pt-6 border-t space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informations de l&apos;entreprise
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-gray-600">Entreprise</p>
                      <p className="font-medium">{subscription.company.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">
                        {subscription.company.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lien vers la facture */}
                {subscription.payment.lastInvoiceUrl && (
                  <div className="pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(
                          subscription.payment.lastInvoiceUrl,
                          "_blank"
                        )
                      }
                      className="w-full sm:w-auto"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Voir la facture
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
