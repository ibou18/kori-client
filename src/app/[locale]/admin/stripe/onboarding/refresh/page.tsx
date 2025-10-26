"use client";
import { useEffect } from "react";
import { requestWrapper } from "@/config/requestsConfig";

export default function RefreshPage() {
  useEffect(() => {
    async function refreshStripeLink() {
      try {
        // Appel à votre API pour générer un nouveau lien
        const response = await requestWrapper.post(
          "/stripe/refresh-connect-link"
        );

        // Redirection vers le nouveau lien d'onboarding
        if (response.data.url) {
          window.location.href = response.data.url;
        }
      } catch (error) {
        console.error("Erreur lors du rafraîchissement du lien Stripe:", error);
        // Afficher un message d'erreur à l'utilisateur
      }
    }

    refreshStripeLink();
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      <p className="mt-4 text-gray-600">Actualisation en cours...</p>
    </div>
  );
}
