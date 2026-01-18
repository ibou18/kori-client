/**
 * Utilitaires pour formater et valider les numéros de téléphone
 */

interface PhoneFormat {
  pattern: RegExp;
  format: (digits: string) => string;
  placeholder: string;
  maxLength: number;
}

const PHONE_FORMATS: Record<string, PhoneFormat> = {
  "+1": {
    // Canada/US - Format: (XXX) XXX-XXXX
    pattern: /^(\d{3})(\d{3})(\d{4})$/,
    format: (digits: string) => {
      const cleaned = digits.replace(/\D/g, "");
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6)
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
    },
    placeholder: "(514) XXX-XXXX",
    maxLength: 10,
  },
  "+33": {
    // France - Format: XX XX XX XX XX
    pattern: /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
    format: (digits: string) => {
      const cleaned = digits.replace(/\D/g, "");
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 4)
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
      if (cleaned.length <= 6)
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(
          4
        )}`;
      if (cleaned.length <= 8)
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(
          4,
          6
        )} ${cleaned.slice(6)}`;
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(
        4,
        6
      )} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    },
    placeholder: "01 23 45 67 89",
    maxLength: 10,
  },
  "+221": {
    // Sénégal - Format: XX XXX XX XX
    pattern: /^(\d{2})(\d{3})(\d{2})(\d{2})$/,
    format: (digits: string) => {
      const cleaned = digits.replace(/\D/g, "");
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 5)
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
      if (cleaned.length <= 7)
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(
          5
        )}`;
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(
        5,
        7
      )} ${cleaned.slice(7, 9)}`;
    },
    placeholder: "77 123 45 67",
    maxLength: 9,
  },
  "+32": {
    // Belgique - Format: XXX XX XX XX
    pattern: /^(\d{3})(\d{2})(\d{2})(\d{2})$/,
    format: (digits: string) => {
      const cleaned = digits.replace(/\D/g, "");
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 5)
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      if (cleaned.length <= 7)
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(
          5
        )}`;
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(
        5,
        7
      )} ${cleaned.slice(7, 9)}`;
    },
    placeholder: "123 45 67 89",
    maxLength: 9,
  },
  "+216": {
    // Tunisie - Format: XX XXX XXX
    pattern: /^(\d{2})(\d{3})(\d{3})$/,
    format: (digits: string) => {
      const cleaned = digits.replace(/\D/g, "");
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 5)
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(
        5,
        8
      )}`;
    },
    placeholder: "12 345 678",
    maxLength: 8,
  },
  "+213": {
    // Algérie - Format: XXX XXX XXX
    pattern: /^(\d{3})(\d{3})(\d{3})$/,
    format: (digits: string) => {
      const cleaned = digits.replace(/\D/g, "");
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6)
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6,
        9
      )}`;
    },
    placeholder: "123 456 789",
    maxLength: 9,
  },
};

/**
 * Formate un numéro de téléphone selon l'indicatif du pays
 * @param phone - Le numéro de téléphone à formater
 * @param countryCode - L'indicatif du pays (ex: "+1", "+33")
 * @returns Le numéro formaté
 */
export const formatPhoneNumber = (
  phone: string,
  countryCode: string
): string => {
  if (!phone || !countryCode) return phone;

  const format = PHONE_FORMATS[countryCode];
  if (!format) {
    // Format par défaut si le pays n'est pas reconnu
    return phone.replace(/\D/g, "");
  }

  return format.format(phone);
};

/**
 * Valide un numéro de téléphone selon l'indicatif du pays
 * @param phone - Le numéro de téléphone à valider
 * @param countryCode - L'indicatif du pays
 * @returns true si le numéro est valide
 */
export const validatePhoneNumber = (
  phone: string,
  countryCode: string
): boolean => {
  if (!phone || !countryCode) return false;

  const format = PHONE_FORMATS[countryCode];
  if (!format) {
    // Validation par défaut : au moins 8 chiffres
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 8;
  }

  const cleaned = phone.replace(/\D/g, "");
  return format.pattern.test(cleaned) && cleaned.length === format.maxLength;
};

/**
 * Obtient le placeholder pour un indicatif de pays
 * @param countryCode - L'indicatif du pays
 * @returns Le placeholder
 */
export const getPhonePlaceholder = (countryCode: string): string => {
  const format = PHONE_FORMATS[countryCode];
  return format?.placeholder || "1234567890";
};

/**
 * Obtient la longueur maximale pour un indicatif de pays
 * @param countryCode - L'indicatif du pays
 * @returns La longueur maximale
 */
export const getPhoneMaxLength = (countryCode: string): number => {
  const format = PHONE_FORMATS[countryCode];
  return format?.maxLength || 10;
};

/**
 * Nettoie un numéro de téléphone (enlève tous les caractères non numériques)
 * @param phone - Le numéro de téléphone à nettoyer
 * @returns Le numéro nettoyé
 */
export const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
};

