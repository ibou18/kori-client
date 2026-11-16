"use client";

import {
  getMyStripeAccountApi,
  openMyStripeDashboardApi,
  startMyStripeOnboardingApi,
} from "@/app/data/services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Encaissement en ligne (Stripe Connect) côté propriétaire.
 * Serveur : GET /stripe-connect/me, POST /me/onboarding, POST /me/dashboard.
 */
export type StripeConnectStatus =
  | "NOT_STARTED"
  | "INCOMPLETE"
  | "ACTION_REQUIRED"
  | "IN_REVIEW"
  | "ACTIVE";

export interface StripeConnectOverview {
  salonId: string;
  status: StripeConnectStatus;
  hasAccount: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirementsCount: number;
  currentDeadline: string | null;
  disabledReason: string | null;
  depositEnabled: boolean;
}

export const STRIPE_CONNECT_KEY = "stripe-connect-me";

/** Chemin de la page, relatif à la locale (ex. `/fr` + ce chemin). */
export const ENCAISSEMENT_PATH = "/admin/encaissement";

const MESSAGES: Record<string, string> = {
  SALON_NOT_FOUND: "Aucun salon n'est associé à votre compte.",
  STRIPE_CONNECT_INVALID_RETURN_URL:
    "Cette adresse du site n'est pas autorisée pour la configuration des paiements. Contactez le support korí.",
  STRIPE_ONBOARDING_INCOMPLETE:
    "Terminez d'abord la configuration de votre compte de paiement.",
  STRIPE_ACCOUNT_NOT_FOUND: "Aucun compte de paiement n'est encore configuré.",
};

function errorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;
  const code = data?.errorCode as string | undefined;
  return (code && MESSAGES[code]) || fallback;
}

export function useMyStripeAccount(options?: { pollWhilePending?: boolean; enabled?: boolean }) {
  return useQuery({
    queryKey: [STRIPE_CONNECT_KEY],
    enabled: options?.enabled ?? true,
    retry: 1,
    queryFn: async () => (await getMyStripeAccountApi()).data as StripeConnectOverview,
    staleTime: 30_000,
    // Après un retour de Stripe, la vérification peut prendre quelques secondes :
    // on relit l'état tant qu'il n'est pas définitif.
    refetchInterval: (query) => {
      if (!options?.pollWhilePending) return false;
      const status = query.state.data?.status;
      return status === "IN_REVIEW" || status === "INCOMPLETE" ? 5_000 : false;
    },
  });
}

/** Ouvre le formulaire Stripe (crée le compte au premier passage). */
export function useStartStripeOnboarding(locale: string) {
  return useMutation({
    mutationFn: async () => {
      const page = `${window.location.origin}/${locale}${ENCAISSEMENT_PATH}`;
      const res = await startMyStripeOnboardingApi({
        returnUrl: `${page}?stripe=retour`,
        refreshUrl: `${page}?stripe=expire`,
      });
      return res.data;
    },
    onSuccess: ({ url }) => {
      window.location.assign(url);
    },
    onError: (error) => {
      toast.error(
        errorMessage(error, "Impossible d'ouvrir la configuration des paiements. Réessayez dans un instant."),
      );
    },
  });
}

/** Ouvre le tableau de bord Stripe Express dans un nouvel onglet. */
export function useOpenStripeDashboard() {
  return useMutation({
    mutationFn: async () => (await openMyStripeDashboardApi()).data,
    onSuccess: ({ url }) => {
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      // Bloqueur de fenêtres : on bascule dans l'onglet courant.
      if (!opened) window.location.assign(url);
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Impossible d'ouvrir votre tableau de bord Stripe."));
    },
  });
}
