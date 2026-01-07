"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatPhoneNumber,
  getPhoneMaxLength,
  getPhonePlaceholder,
  validatePhoneNumber,
} from "@/utils/phoneFormatter";
import { useState } from "react";

interface FormattedPhoneInputProps {
  value: string;
  countryCode: string;
  selectedCountryCode?: string;
  onPhoneChange: (phone: string) => void;
  onCountryCodeChange?: (dialCode: string, isoCode: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  id?: string;
}

const COUNTRY_CODES = [
  { dialCode: "+1", isoCode: "CA", name: "Canada/US" },
  { dialCode: "+33", isoCode: "FR", name: "France" },
  { dialCode: "+221", isoCode: "SN", name: "Sénégal" },
  { dialCode: "+32", isoCode: "BE", name: "Belgique" },
  { dialCode: "+216", isoCode: "TN", name: "Tunisie" },
  { dialCode: "+213", isoCode: "DZ", name: "Algérie" },
];

export const FormattedPhoneInput: React.FC<FormattedPhoneInputProps> = ({
  value,
  countryCode,
  selectedCountryCode = "CA",
  onPhoneChange,
  onCountryCodeChange,
  error,
  disabled = false,
  placeholder,
  label,
  required = false,
  id = "phone",
}) => {
  const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const formatted = formatPhoneNumber(text, countryCode);
    onPhoneChange(formatted);
  };

  const handleCountryCodeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = COUNTRY_CODES.find(
      (cc) => cc.dialCode === e.target.value
    );
    if (selected && onCountryCodeChange) {
      onCountryCodeChange(selected.dialCode, selected.isoCode);
      // Réinitialiser le numéro quand l'indicatif change
      onPhoneChange("");
    }
  };

  const displayPlaceholder = placeholder || getPhonePlaceholder(countryCode);
  const maxLength = getPhoneMaxLength(countryCode) + 5; // +5 pour les caractères de formatage

  return (
    <div className="space-y-1">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={handleCountryCodeChange}
          disabled={disabled}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {COUNTRY_CODES.map((cc) => (
            <option key={cc.dialCode} value={cc.dialCode}>
              {cc.dialCode} ({cc.name})
            </option>
          ))}
        </select>
        <div className="flex-1">
          <Input
            id={id}
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder={displayPlaceholder}
            disabled={disabled}
            maxLength={maxLength}
            className={error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

/**
 * Hook pour valider un numéro de téléphone
 */
export const usePhoneValidation = (
  phone: string,
  countryCode: string
): { isValid: boolean; errorMessage: string | null } => {
  if (!phone || !phone.trim()) {
    return { isValid: false, errorMessage: "Le numéro de téléphone est requis" };
  }

  const isValid = validatePhoneNumber(phone, countryCode);
  if (!isValid) {
    const format = getPhonePlaceholder(countryCode);
    return {
      isValid: false,
      errorMessage: `Format de téléphone invalide. Format attendu: ${format}`,
    };
  }

  return { isValid: true, errorMessage: null };
};

