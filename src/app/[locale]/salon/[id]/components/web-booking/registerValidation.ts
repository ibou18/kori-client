/**
 * Aligné sur kori-server/src/utils/validationUtils.ts (isValidPhone, isValidName).
 */

import {
  buildE164Phone,
  getPhonePlaceholder,
  validatePhoneNumber,
} from "@/utils/phoneFormatter";

const NAME_RE = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;

/** Téléphone optionnel : si saisi, doit correspondre au pays choisi. */
export function validateOptionalRegistrationPhone(
  dialCode: string,
  localFormatted: string
): string | null {
  if (!localFormatted.trim()) return null;
  if (!validatePhoneNumber(localFormatted, dialCode)) {
    return `Format invalide pour cet indicatif. Ex. : ${getPhonePlaceholder(dialCode)}`;
  }
  return null;
}

export function phoneE164ForRegister(
  dialCode: string,
  localFormatted: string
): string | undefined {
  return buildE164Phone(dialCode, localFormatted);
}

export function validateClientRegistrationNames(
  firstName: string,
  lastName: string
): string | null {
  const fn = firstName.trim();
  const ln = lastName.trim();
  if (!NAME_RE.test(fn)) {
    return "Prénom : 2 à 50 caractères (lettres, espaces, tiret ou apostrophe).";
  }
  if (!NAME_RE.test(ln)) {
    return "Nom : 2 à 50 caractères (lettres, espaces, tiret ou apostrophe).";
  }
  return null;
}

export function getRegisterErrorMessage(err: unknown): string {
  const ax = err as {
    response?: {
      data?: {
        message?: string;
        details?: { message?: string } | string;
      };
    };
    formattedMessage?: string;
    message?: string;
  };
  const data = ax?.response?.data;
  const details = data?.details;
  const detailMsg =
    typeof details === "object" && details?.message
      ? details.message
      : typeof details === "string"
        ? details
        : undefined;
  return (
    detailMsg ||
    data?.message ||
    ax?.formattedMessage ||
    ax?.message ||
    "Erreur lors de l'inscription."
  );
}
