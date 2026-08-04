/**
 * Validation / messages d'erreur pour le formulaire prospect (landing).
 */

export type QuickRegisterFormInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  services: string[];
};

export type QuickRegisterFieldErrors = Partial<{
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  services: string;
}>;

/**
 * Valide le formulaire prospect.
 * @returns erreurs par champ (objet vide = OK)
 */
export function validateQuickRegisterForm(
  formData: QuickRegisterFormInput,
): QuickRegisterFieldErrors {
  const errors: QuickRegisterFieldErrors = {};

  if (!formData.email || !formData.email.includes("@")) {
    errors.email = "Email invalide";
  }
  if (!formData.firstName.trim()) {
    errors.firstName = "Prénom requis";
  }
  if (!formData.lastName.trim()) {
    errors.lastName = "Nom requis";
  }
  if (!formData.phone || formData.phone.length < 8) {
    errors.phone = "Numéro de téléphone invalide";
  }
  if (formData.services.length === 0) {
    errors.services = "Sélectionnez au moins un service";
  }

  return errors;
}

/**
 * Message lisible pour les erreurs d'inscription prospect.
 */
export function getQuickRegisterErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { errorCode?: string; message?: string } };
    errorCode?: string;
    message?: string;
  };

  const errorCode = err?.response?.data?.errorCode || err?.errorCode;

  const errorMessages: Record<string, string> = {
    EMAIL_ALREADY_EXISTS:
      "Cette adresse email est déjà enregistrée. Nous vous contacterons bientôt !",
    VALIDATION_ERROR: "Veuillez vérifier les informations saisies.",
    NETWORK_ERROR:
      "Problème de connexion. Vérifiez votre connexion internet.",
  };

  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  return (
    err?.response?.data?.message ||
    err?.message ||
    "Une erreur est survenue. Veuillez réessayer."
  );
}
