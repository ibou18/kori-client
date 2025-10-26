"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { EmptyState } from "@/app/components/EmptyState";
import SubscriptionDetails from "@/app/components/SubscriptionDetails";
import {
  useCheckoutStripeApi,
  useCreateSubscription,
  useGetCurrentStatusApi,
  useGetProductsApi,
} from "@/app/data/hooks";
import { message } from "antd";
import { useState } from "react";
import { SparklesIcon } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SubscriptionPage() {
  const { data: session }: any = useSession();
  const {
    data: currentSubscription,
    error,
    isLoading: loading,
  } = useGetCurrentStatusApi();
  console.log("currentSubscription", currentSubscription);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: products } = useGetProductsApi();
  const { mutate: checkoutStripeApi } = useCheckoutStripeApi();
  const { mutate: createSubscription, isPending } = useCreateSubscription();

  const handleSelectProduct = async (priceId: string) => {
    try {
      setIsLoading(true);
      setSelectedPriceId(priceId);
      await checkoutStripeApi(
        { priceId: priceId, companyId: session?.user?.companyId },
        {
          onSuccess: (response) => {
            console.log("response", response);
            if (response?.checkoutUrl) {
              window.location.href = response.checkoutUrl;
            } else if (response.portalUrl) {
              window.location.href = response.portalUrl;
            } else {
              message.error(
                "Une erreur est survenue lors de la création du checkout"
              );
            }
          },
          onError: (error) => {
            console.error("Error during checkout:", error);
            message.error(
              "Une erreur est survenue lors de la création du checkout"
            );
          },
        }
      );
    } catch (error) {
      console.error("Erreur lors de la création du checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Abonnements">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Abonnements">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        {currentSubscription?.status === "canceled" || !currentSubscription ? (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Choisissez votre plan
              </h2>
              <p className="text-lg text-gray-600">
                Sélectionnez l&apos;offre qui correspond le mieux à vos besoins
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {products?.map((product: any) => (
                <div
                  key={product.id}
                  className={`relative rounded-2xl border p-8 ${
                    product.name === "Pro"
                      ? "bg-gradient-to-b from-primary/5 to-transparent ring-2 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  {product.name === "Pro" && (
                    <div className="absolute -top-3 -right-3">
                      <SparklesIcon className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600">{product.description}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-b pt-0">
                      {product.prices.map((price: any) => (
                        <div
                          key={price.id}
                          className="rounded-lg border p-4 mb-3 hover:border-primary transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xl font-bold">
                                {new Intl.NumberFormat("fr-CA", {
                                  style: "currency",
                                  currency: price.currency,
                                }).format(price.amount)}
                                <span className="text-sm font-normal text-gray-600">
                                  /{price.interval === "month" ? "mois" : "an"}
                                </span>
                              </p>
                              {price.interval === "year" && (
                                <p className="text-sm text-green-600 font-medium">
                                  {product.name === "Pro"
                                    ? "Économisez 20%"
                                    : "Économisez 15%"}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleSelectProduct(price.id)}
                              disabled={
                                isLoading && selectedPriceId === price.id
                              }
                              className={`px-4 py-2 rounded-lg ${
                                isLoading && selectedPriceId === price.id
                                  ? "bg-gray-300"
                                  : product.name === "Pro"
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : "bg-gray-900 text-white hover:bg-gray-800"
                              } transition-colors`}
                            >
                              {isLoading && selectedPriceId === price.id
                                ? "Chargement..."
                                : "Sélectionner"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <ul className="space-y-3">
                      {product.features.map(
                        (feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-sm">{feature}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <SubscriptionDetails
            subscription={currentSubscription}
            loading={loading}
            error={error ? error.message : null}
          />
        )}
      </div>
    </PageWrapper>
  );
}
