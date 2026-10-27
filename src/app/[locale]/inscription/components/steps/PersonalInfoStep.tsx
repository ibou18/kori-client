"use client";

import { AuthField, PasswordField } from "@/app/components/auth/AuthField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormattedPhoneInput,
  usePhoneValidation,
} from "@/components/ui/FormattedPhoneInput";
import { validateProviderPersonalInfo } from "@/utils/providerRegisterValidation";
import { ArrowRight, Mail, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ProgressIndicator } from "../ProgressIndicator";

interface FormData {
  email: string;
  lastName: string;
  firstName: string;
  phone: string;
  countryCode: string;
  selectedCountryCode?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface PersonalInfoStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function PersonalInfoStep({
  formData,
  updateFormData,
  onNext,
  currentStep,
  totalSteps,
}: PersonalInfoStepProps) {
  const { isValid: isPhoneValid, errorMessage: phoneError } =
    usePhoneValidation(formData.phone, formData.countryCode);

  const handleValidate = () => {
    const error = validateProviderPersonalInfo(formData);
    if (error) {
      toast.error(error);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle="Informations personnelles"
      />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Créons votre compte.
        </h2>
        <p className="mt-1 text-gray-600">
          Ces informations servent à vous connecter et à vous joindre. Rien
          n&apos;est public.
        </p>
      </div>

      <div className="space-y-5">
        <AuthField
          id="email"
          label="Email *"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <AuthField
            id="firstName"
            label="Prénom *"
            icon={User}
            autoComplete="given-name"
            placeholder="Votre prénom"
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
          />
          <AuthField
            id="lastName"
            label="Nom *"
            autoComplete="family-name"
            placeholder="Votre nom"
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
          />
        </div>

        <FormattedPhoneInput
          value={formData.phone}
          countryCode={formData.countryCode}
          selectedCountryCode={formData.selectedCountryCode || "CA"}
          onPhoneChange={(phone: string) => updateFormData({ phone })}
          onCountryCodeChange={(dialCode: string, isoCode: string) =>
            updateFormData({
              countryCode: dialCode,
              selectedCountryCode: isoCode,
            })
          }
          error={
            formData.phone.trim() && !isPhoneValid
              ? phoneError || undefined
              : undefined
          }
          label="Téléphone"
          required
          id="phone"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <PasswordField
            id="password"
            label="Mot de passe *"
            autoComplete="new-password"
            placeholder="Minimum 6 caractères"
            value={formData.password}
            onChange={(e) => updateFormData({ password: e.target.value })}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirmer *"
            autoComplete="new-password"
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmPassword}
            onChange={(e) =>
              updateFormData({ confirmPassword: e.target.value })
            }
          />
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <Checkbox
            checked={formData.acceptTerms}
            onChange={(checked: boolean) =>
              updateFormData({ acceptTerms: checked })
            }
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 leading-relaxed cursor-pointer"
            onClick={() =>
              updateFormData({ acceptTerms: !formData.acceptTerms })
            }
          >
            J&apos;accepte la{" "}
            <Link
              href="/terms/privacy-policy"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              politique de confidentialité
            </Link>
            , les{" "}
            <Link
              href="/terms/cgv"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              conditions générales
            </Link>{" "}
            et les{" "}
            <Link
              href="/terms/cgu-pro"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              conditions de service
            </Link>
            .
          </label>
        </div>

        <Button
          onClick={handleValidate}
          size="lg"
          className="h-12 w-full rounded-full text-base shadow-[0_12px_30px_-10px_rgba(83,116,93,0.7)] transition-transform hover:-translate-y-0.5"
          disabled={
            !formData.email.trim() ||
            !formData.lastName.trim() ||
            !formData.firstName.trim() ||
            !formData.phone.trim() ||
            !formData.password.trim() ||
            !formData.confirmPassword.trim() ||
            !formData.acceptTerms
          }
        >
          Continuer
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

