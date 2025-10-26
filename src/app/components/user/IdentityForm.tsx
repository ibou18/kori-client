/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

import PersonalInfoStep from "./PersonalInfoStep";
import DocumentUploadStep from "./DocumentUploadStep";
import SelfieVerificationStep from "./SelfieVerificationStep";
import ConfirmationStep from "./ConfirmationStep";
import StepIndicator from "./StepIndicator";
import { requestWrapper } from "@/config/requestsConfig";
import { useSession } from "next-auth/react";
import { IUserSession } from "@/app/interfaceHop";

// Interface pour les données personnelles
interface PersonalInfo {
  fullName: string;
  address: string;
  phoneNumber: string;
}

// Interface pour les erreurs de validation
interface FormErrors {
  fullName?: string;
  address?: string;
  phoneNumber?: string;
}

const IdentityCheck = () => {
  const { data: session }: any = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null
  );

  // État pour les données du formulaire
  const [formData, setFormData] = useState<PersonalInfo>({
    fullName: session?.user?.firstName + " " + session?.user?.firstName || "",
    address: "",
    phoneNumber: session?.user?.phone || "",
  });

  // État pour les erreurs de validation
  const [errors, setErrors] = useState<FormErrors>({});

  // État pour la visibilité des alertes
  const [alertVisible, setAlertVisible] = useState(true);

  // Références pour les fichiers uploadés
  const idFrontRef = useRef<File | null>(null);
  const idBackRef = useRef<File | null>(null);
  const selfieRef = useRef<File | null>(null);

  // Prévisualisations des images
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validation personnalisée
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName =
        "Le nom complet doit comporter au moins 2 caractères";
    }

    if (!formData.address || formData.address.length < 5) {
      newErrors.address = "Veuillez entrer une adresse valide";
    }

    if (
      !formData.phoneNumber ||
      !/^[0-9+\s]{10,15}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Numéro de téléphone invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer le téléchargement d'image et afficher l'aperçu
  const handleFileUpload = (
    file: File | null,
    setPreview: (url: string | null) => void,
    fileRef: React.MutableRefObject<File | null>
  ) => {
    if (!file) return;

    fileRef.current = file;

    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Soumettre les données de vérification
  const handleSubmit = async () => {
    if (!idFrontRef.current || !selfieRef.current) {
      toast.error("Veuillez télécharger toutes les images requises");
      return;
    }

    console.log("idFrontRef", idFrontRef);
    console.log("selfieRef", selfieRef);
    console.log("idBackRef", idBackRef);

    const formDataToSend = new FormData();

    // Ajouter les données personnelles
    formDataToSend.append("verificationData", JSON.stringify(formData));

    // Ajouter les fichiers
    formDataToSend.append("idFront", idFrontRef.current);
    if (idBackRef.current) {
      formDataToSend.append("idBack", idBackRef.current);
    }
    formDataToSend.append("selfie", selfieRef.current);

    setIsSubmitting(true);

    try {
      const response = await requestWrapper.post(
        "/identity/verify",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success("Vérification d'identité soumise avec succès");
        setVerificationStatus("success");
        setStep(4); // Aller à l'étape de confirmation
      } else {
        toast.error(data.message || "Erreur lors de la soumission");
        setVerificationStatus("error");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification d'identité:", error);
      toast.error("Une erreur s'est produite. Veuillez réessayer plus tard.");
      setVerificationStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonctions pour naviguer entre les étapes
  const nextStep = () => {
    if (step === 1) {
      const isValid = validateForm();
      if (isValid) setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Vérification d'Identité</CardTitle>
        <CardDescription className="text-center">
          Pour assurer la sécurité de tous, nous devons vérifier votre identité.
        </CardDescription>
        <StepIndicator currentStep={step} />
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <PersonalInfoStep
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />
        )}
        {step === 2 && (
          <DocumentUploadStep
            idFrontRef={idFrontRef}
            idBackRef={idBackRef}
            idFrontPreview={idFrontPreview}
            idBackPreview={idBackPreview}
            setIdFrontPreview={setIdFrontPreview}
            setIdBackPreview={setIdBackPreview}
            handleFileUpload={handleFileUpload}
          />
        )}
        {step === 3 && (
          <SelfieVerificationStep
            formData={formData}
            selfieRef={selfieRef}
            idFrontPreview={idFrontPreview}
            idBackPreview={idBackPreview}
            selfiePreview={selfiePreview}
            setSelfiePreview={setSelfiePreview}
            handleFileUpload={handleFileUpload}
          />
        )}
        {step === 4 && (
          <ConfirmationStep onReturn={() => router.push("/admin/dashboard")} />
        )}
      </CardContent>

      {step < 4 && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>

          {step === 3 ? (
            <Button
              onClick={handleSubmit}
              //   disabled={
              //     isSubmitting || !idFrontRef.current || !selfieRef.current
              //   }
            >
              {isSubmitting ? "Envoi en cours..." : "Soumettre la vérification"}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default IdentityCheck;
