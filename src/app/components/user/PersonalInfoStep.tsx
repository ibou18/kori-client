/* eslint-disable react/no-unescaped-entities */
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfo {
  fullName: string;
  address: string;
  phoneNumber: string;
}

interface FormErrors {
  fullName?: string;
  address?: string;
  phoneNumber?: string;
}

interface PersonalInfoStepProps {
  formData: PersonalInfo;
  errors: FormErrors;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoStep = ({
  formData,
  errors,
  onChange,
}: PersonalInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nom complet</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Entrez votre nom complet"
          value={formData.fullName}
          onChange={onChange}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && (
          <p className="text-sm font-medium text-destructive">
            {errors.fullName}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Votre nom complet tel qu'il apparaît sur votre pièce d'identité.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          placeholder="Entrez votre adresse"
          value={formData.address}
          onChange={onChange}
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && (
          <p className="text-sm font-medium text-destructive">
            {errors.address}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Votre adresse de résidence actuelle.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          placeholder="Entrez votre numéro de téléphone"
          value={formData.phoneNumber}
          onChange={onChange}
          className={errors.phoneNumber ? "border-destructive" : ""}
        />
        {errors.phoneNumber && (
          <p className="text-sm font-medium text-destructive">
            {errors.phoneNumber}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Un numéro de téléphone valide où vous pouvez être contacté.
        </p>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
