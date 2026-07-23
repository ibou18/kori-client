/**
 * Validation et mapping d'erreurs pour l'inscription provider (salon).
 */

import {
  getPhonePlaceholder,
  validatePhoneNumber,
} from "@/utils/phoneFormatter";

export type ProviderPersonalInfoInput = {
  email: string;
  lastName: string;
  firstName: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type ProviderSalonAddressInput = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  apartment?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
} | null;

export type ProviderSalonHoursInput = {
  id: string;
  name: string;
  enabled: boolean;
  openingTime: string;
  closingTime: string;
}[];

export type ProviderSalonInfoInput = {
  salonName: string;
  services: string[];
  salonAddress: ProviderSalonAddressInput;
  extraOffer: "yes" | "no" | "";
  collectDeposit: "yes" | "no" | "";
  salonImages: unknown[];
};

export type ProviderRegisterFormPayload = ProviderPersonalInfoInput & {
  services: string[];
  extraOffer: "yes" | "no";
  collectDeposit: "yes" | "no";
  salonName: string;
  salonDescription: string;
  salonHours: ProviderSalonHoursInput;
  salonAddress: ProviderSalonAddressInput;
};

const KNOWN_SALON_TYPES = [
  "HAIRDRESSER",
  "BARBER",
  "NAIL_SALON",
  "MAQUILLAGE",
  "CILS",
  "BODY_CARE",
];

/**
 * Valide l'étape informations personnelles.
 * @returns message d'erreur ou null si OK
 */
export function validateProviderPersonalInfo(
  formData: ProviderPersonalInfoInput,
): string | null {
  if (!formData.email.trim()) {
    return "L'email est requis";
  }
  if (!formData.lastName.trim()) {
    return "Le nom est requis";
  }
  if (!formData.firstName.trim()) {
    return "Le prénom est requis";
  }
  if (!formData.phone.trim()) {
    return "Le numéro de téléphone est requis";
  }
  if (!validatePhoneNumber(formData.phone, formData.countryCode)) {
    return `Format de téléphone invalide. Format attendu: ${getPhonePlaceholder(formData.countryCode)}`;
  }
  if (!formData.password.trim() || formData.password.length < 6) {
    return "Le mot de passe doit contenir au moins 6 caractères";
  }
  if (formData.password !== formData.confirmPassword) {
    return "Les mots de passe ne correspondent pas";
  }
  if (!formData.acceptTerms) {
    return "Vous devez accepter les conditions d'utilisation";
  }
  return null;
}

/**
 * Valide l'étape informations salon.
 * @returns message d'erreur ou null si OK
 */
export function validateSalonInfoStep(
  formData: ProviderSalonInfoInput,
): string | null {
  if (!formData.salonName?.trim()) {
    return "Veuillez indiquer le nom de votre salon";
  }
  if (formData.services.length === 0) {
    return "Veuillez sélectionner au moins un service";
  }
  if (!formData.salonAddress || !formData.salonAddress.street?.trim()) {
    return "L'adresse est requise";
  }
  if (!formData.salonAddress.city?.trim()) {
    return "La ville est requise";
  }
  if (!formData.salonAddress.postalCode?.trim()) {
    return "Le code postal est requis";
  }
  if (!formData.extraOffer) {
    return "Veuillez indiquer si vous proposez des services à domicile";
  }
  if (!formData.collectDeposit) {
    return "Veuillez indiquer si vous souhaitez collecter un acompte";
  }
  if (formData.salonImages.length === 0) {
    return "Veuillez ajouter au moins une photo de votre salon";
  }
  return null;
}

/**
 * Transforme le formulaire d'inscription en payload API registerSalon.
 */
export function transformFormDataToSalonPayload(
  data: ProviderRegisterFormPayload,
) {
  const getDayHours = (dayId: string) => {
    const day = data.salonHours.find((d) => d.id === dayId);
    if (!day?.enabled || !day.openingTime || !day.closingTime) {
      return null;
    }
    return { open: day.openingTime, close: day.closingTime };
  };

  const openingHours = {
    monday: getDayHours("monday"),
    tuesday: getDayHours("tuesday"),
    wednesday: getDayHours("wednesday"),
    thursday: getDayHours("thursday"),
    friday: getDayHours("friday"),
    saturday: getDayHours("saturday"),
    sunday: getDayHours("sunday"),
  };

  const salonTypes = data.services.filter((serviceId) =>
    KNOWN_SALON_TYPES.includes(serviceId),
  );

  const rawAddress = data.salonAddress;
  const gps =
    rawAddress &&
    rawAddress.latitude != null &&
    rawAddress.longitude != null &&
    Number.isFinite(Number(rawAddress.latitude)) &&
    Number.isFinite(Number(rawAddress.longitude))
      ? {
          latitude: Number(rawAddress.latitude),
          longitude: Number(rawAddress.longitude),
        }
      : null;

  const addressPayload =
    rawAddress != null
      ? {
          street: rawAddress.street,
          city: rawAddress.city,
          postalCode: rawAddress.postalCode,
          country: rawAddress.country,
          apartment: rawAddress.apartment,
          ...(gps ?? {}),
        }
      : {
          street: "À définir",
          city: "À définir",
          postalCode: "À définir",
          country: "Canada",
        };

  return {
    user: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.countryCode + data.phone,
      countryCode: data.countryCode,
      password: data.password,
    },
    salon: {
      name: data.salonName,
      description: data.salonDescription,
      address: addressPayload,
      phone: data.countryCode + data.phone,
      email: data.email,
      salonTypes,
      services: data.services,
      extraOffer: data.extraOffer,
      collectDeposit: data.collectDeposit,
    },
    openingHours,
  };
}

/**
 * Message lisible pour les erreurs d'inscription provider.
 */
export function getProviderRegisterErrorMessage(error: unknown): string {
  const err = error as {
    response?: {
      data?: {
        prismaError?: { code?: string; meta?: { target?: string[] } };
        errorCode?: string;
        message?: string;
        error?: string;
      };
    };
    prismaError?: { code?: string; meta?: { target?: string[] } };
    code?: string;
    errorCode?: string;
    message?: string;
    errorDetails?: { message?: string };
    meta?: { target?: string[] };
  };

  const prismaError =
    err?.response?.data?.prismaError ||
    err?.prismaError ||
    (err?.code === "P2002" ? err : null);

  if (prismaError?.code === "P2002") {
    const target = prismaError?.meta?.target || [];
    if (Array.isArray(target)) {
      if (target.includes("phone")) {
        return "Ce numéro de téléphone est déjà utilisé. Veuillez utiliser un autre numéro ou vous connecter si vous avez déjà un compte.";
      }
      if (target.includes("email")) {
        return "Cette adresse email est déjà utilisée. Essayez de vous connecter si vous avez déjà un compte.";
      }
    }
    return "Ces informations sont déjà utilisées par un autre compte. Veuillez vérifier vos données ou vous connecter.";
  }

  const errorCode = err?.response?.data?.errorCode || err?.errorCode;

  const errorMessages: Record<string, string> = {
    EMAIL_ALREADY_EXISTS:
      "Cette adresse email est déjà utilisée. Essayez de vous connecter.",
    PHONE_ALREADY_EXISTS:
      "Ce numéro de téléphone est déjà utilisé. Veuillez utiliser un autre numéro ou vous connecter si vous avez déjà un compte.",
    SALON_EMAIL_ALREADY_EXISTS:
      "L'email du salon est déjà utilisé par un autre établissement.",
    INVALID_PASSWORD:
      "Le mot de passe ne respecte pas les critères de sécurité.",
    VALIDATION_ERROR: "Veuillez vérifier les informations saisies.",
    USER_NOT_FOUND: "Utilisateur non trouvé.",
    NETWORK_ERROR:
      "Problème de connexion. Vérifiez votre connexion internet.",
  };

  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  const errorMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    err?.errorDetails?.message ||
    "";

  if (errorMessage) {
    const lower = errorMessage.toLowerCase();
    if (
      lower.includes("unique constraint") ||
      lower.includes("already exists") ||
      lower.includes("déjà utilisé")
    ) {
      if (lower.includes("phone") || lower.includes("téléphone")) {
        return "Ce numéro de téléphone est déjà utilisé. Veuillez utiliser un autre numéro ou vous connecter si vous avez déjà un compte.";
      }
      if (lower.includes("email") || lower.includes("courriel")) {
        return "Cette adresse email est déjà utilisée. Essayez de vous connecter si vous avez déjà un compte.";
      }
    }
    return errorMessage;
  }

  return "Une erreur est survenue. Veuillez réessayer.";
}
