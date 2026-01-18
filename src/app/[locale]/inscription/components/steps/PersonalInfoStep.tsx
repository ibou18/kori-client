"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormattedPhoneInput, usePhoneValidation } from "@/components/ui/FormattedPhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isValid: isPhoneValid, errorMessage: phoneError } =
    usePhoneValidation(formData.phone, formData.countryCode);

  const handleValidate = () => {
    if (!formData.email.trim()) {
      alert("L'email est requis");
      return;
    }
    if (!formData.lastName.trim()) {
      alert("Le nom est requis");
      return;
    }
    if (!formData.firstName.trim()) {
      alert("Le prénom est requis");
      return;
    }
    if (!formData.phone.trim()) {
      alert("Le numéro de téléphone est requis");
      return;
    }
    if (!isPhoneValid) {
      alert(phoneError || "Format de téléphone invalide");
      return;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    if (!formData.acceptTerms) {
      alert("Vous devez accepter les conditions d'utilisation");
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
        <p className="text-gray-600">
          Commencez par remplir vos informations personnelles
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              placeholder="Votre prénom"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              placeholder="Votre nom"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              className="mt-1"
            />
          </div>
      
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

        <div>
          <Label htmlFor="password">Mot de passe *</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 caractères"
              value={formData.password}
              onChange={(e) => updateFormData({ password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmez votre mot de passe"
              value={formData.confirmPassword}
              onChange={(e) =>
                updateFormData({ confirmPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2">
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
          className="w-full"
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
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

