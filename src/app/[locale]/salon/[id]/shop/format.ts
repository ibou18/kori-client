import { formatSalonPriceDollars } from "../components/web-booking/pricing";

/** 2400 → « 24,00 $ ». */
export function formatCents(cents: number): string {
  return `${formatSalonPriceDollars(cents / 100)} $`;
}

/** « Soin du cuir chevelu · 30 ml ». */
export function productMeta(product: { category?: string | null; size?: string | null }): string {
  return [product.category, product.size].filter(Boolean).join(" · ");
}

const STARTS_WITH_VOWEL = /^[aeiouyhàâäéèêëîïôöûü]/i;

/** « d'Aïcha » / « de Marie ». */
export function deName(name: string): string {
  return STARTS_WITH_VOWEL.test(name) ? `d'${name}` : `de ${name}`;
}

/** « qu'Aïcha » / « que Marie ». */
export function queName(name: string): string {
  return STARTS_WITH_VOWEL.test(name) ? `qu'${name}` : `que ${name}`;
}

/** Motifs serveur (errorCode) → message client. */
const PRODUCT_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_AVAILABLE: "Un des produits n'est plus disponible. Retirez-le de votre panier.",
  PRODUCT_OUT_OF_STOCK: "Un des produits n'est plus en stock en quantité suffisante.",
  PRODUCT_QUANTITY_TOO_HIGH: "Quantité trop élevée pour un des produits (20 maximum).",
  PRODUCT_SALES_UNAVAILABLE: "Ce salon ne vend pas de produits en ligne pour le moment.",
  PRODUCT_ORDER_EMPTY: "Votre panier est vide.",
  SALON_CONNECT_UNAVAILABLE: "Ce salon ne peut pas encaisser de paiement pour le moment. Réessayez plus tard.",
  PRODUCT_ORDER_NOT_PAYABLE: "Cette commande n'est plus en attente de paiement.",
};

/**
 * Message lisible d'une erreur d'API. `handleError` (requestsConfig) relance l'erreur
 * axios enrichie de `errorDetails.responseData` = corps de la réponse serveur.
 */
export function readApiError(
  e: unknown,
  extraMessages: Record<string, string> = {},
  fallback = "Une erreur est survenue. Réessayez.",
): { message: string; errorCode?: string; details?: Record<string, unknown> } {
  const data = (e as { errorDetails?: { responseData?: Record<string, unknown> } })?.errorDetails?.responseData;
  const nested = data?.error as Record<string, unknown> | undefined;
  const errorCode = (data?.errorCode ?? nested?.errorCode) as string | undefined;
  const serverMessage = (data?.message ?? nested?.message) as string | undefined;
  const details = (data?.details ?? nested?.details) as Record<string, unknown> | undefined;
  const messages = { ...PRODUCT_ERROR_MESSAGES, ...extraMessages };
  return {
    errorCode,
    details,
    message:
      (errorCode && messages[errorCode]) ||
      serverMessage ||
      (e as { formattedMessage?: string })?.formattedMessage ||
      fallback,
  };
}
