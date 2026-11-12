"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  formatPhoneNumber,
  getPhoneMaxLength,
  getPhonePlaceholder,
  PHONE_COUNTRY_OPTIONS,
  validatePhoneNumber,
} from "@/utils/phoneFormatter";

interface FormattedPhoneInputProps {
  value: string;
  countryCode: string;
  /** ISO pays (ex. CA) — optionnel, pour formulaires qui le stockent ; non utilisé si l’indicatif est partagé (+1). */
  selectedCountryCode?: string;
  onPhoneChange: (phone: string) => void;
  onCountryCodeChange?: (dialCode: string, isoCode: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  id?: string;
  /** Classes pour le select indicatif */
  selectClassName?: string;
  /** Classes pour le champ numéro (pour aligner sa hauteur sur celle du select, ex. `h-12`). */
  inputClassName?: string;
  /** Classes pour le libellé (pour reprendre le style des autres champs du formulaire). */
  labelClassName?: string;
  /** Classes du conteneur (espacement libellé / champs). */
  className?: string;
  /** Affiche seulement le drapeau et l’indicatif (« 🇨🇦 +1 ») au lieu de « Canada / É.-U. (+1) ». */
  dialCodeOnly?: boolean;
}

/** « CA » → « 🇨🇦 » (indicateurs régionaux Unicode). */
const flagEmoji = (isoCode: string) =>
  isoCode
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65));

export const FormattedPhoneInput: React.FC<FormattedPhoneInputProps> = ({
  value,
  countryCode,
  selectedCountryCode: _selectedCountryCode,
  onPhoneChange,
  onCountryCodeChange,
  error,
  disabled = false,
  placeholder,
  label,
  required = false,
  id = "phone",
  selectClassName,
  inputClassName,
  labelClassName,
  className,
  dialCodeOnly = false,
}) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const formatted = formatPhoneNumber(text, countryCode);
    onPhoneChange(formatted);
  };

  const handleCountryCodeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = PHONE_COUNTRY_OPTIONS.find(
      (cc) => cc.dialCode === e.target.value
    );
    if (selected && onCountryCodeChange) {
      onCountryCodeChange(selected.dialCode, selected.isoCode);
      onPhoneChange("");
    }
  };

  const displayPlaceholder = placeholder || getPhonePlaceholder(countryCode);
  const maxLength = getPhoneMaxLength(countryCode) + 5;

  const selectCls =
    selectClassName ??
    "h-9 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed min-w-[9.5rem]";

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label htmlFor={id} className={labelClassName}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        {/* Select natif (clavier, mobile) habillé : flèche custom, apparence système masquée. */}
        <div className="relative shrink-0">
          <select
            value={countryCode}
            onChange={handleCountryCodeChange}
            disabled={disabled}
            aria-label="Indicatif pays"
            className={cn("appearance-none pr-8 tabular-nums", selectCls)}
          >
            {PHONE_COUNTRY_OPTIONS.map((cc) => (
              <option key={cc.dialCode} value={cc.dialCode}>
                {dialCodeOnly ? `${flagEmoji(cc.isoCode)} ${cc.dialCode}` : cc.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 opacity-60"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Input
            id={id}
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder={displayPlaceholder}
            disabled={disabled}
            maxLength={maxLength}
            autoComplete="tel-national"
            className={cn(
              inputClassName,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            )}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
