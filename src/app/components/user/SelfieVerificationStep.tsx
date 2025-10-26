import { MutableRefObject } from "react";
import { Check, X, Info } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import ImageUploader from "./ImageUploader";

interface PersonalInfo {
  fullName: string;
  address: string;
  phoneNumber: string;
}

interface SelfieVerificationStepProps {
  formData: PersonalInfo;
  selfieRef: MutableRefObject<File | null>;
  selfiePreview: string | null;
  idFrontPreview: string | null;
  idBackPreview: string | null;
  setSelfiePreview: (url: string | null) => void;
  handleFileUpload: (
    file: File | null,
    setPreview: (url: string | null) => void,
    fileRef: React.MutableRefObject<File | null>
  ) => void;
}

const SelfieVerificationStep = ({
  formData,
  selfieRef,
  selfiePreview,
  idFrontPreview,
  idBackPreview,
  setSelfiePreview,
  handleFileUpload,
}: SelfieVerificationStepProps) => {
  return (
    <div className="space-y-6">
      {/* Message informatif remplaçant l'alerte */}
      <div className="bg-blue-50 text-blue-800 rounded-md p-3 flex items-start">
        <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p>
            Prenez un selfie clair de votre visage. Assurez-vous que votre
            visage est bien éclairé et clairement visible sans lunettes de
            soleil ou masque.
          </p>
        </div>
      </div>

      <ImageUploader
        id="selfie"
        label="Selfie avec votre visage"
        description="Cette photo sera comparée à celle de votre pièce d'identité."
        accept="image/jpeg,image/png"
        preview={selfiePreview}
        fileRef={selfieRef}
        setPreview={setSelfiePreview}
        handleFileUpload={handleFileUpload}
        required={true}
        icon="camera"
        minHeight="250px"
      />

      <div className="bg-gray-50 rounded-lg p-4 space-y-2 border">
        <h4 className="font-medium">Résumé de votre vérification</h4>

        <div className="grid grid-cols-2 gap-1 text-sm">
          <span className="text-muted-foreground">Nom complet:</span>
          <span className="font-medium">{formData.fullName}</span>

          <span className="text-muted-foreground">Adresse:</span>
          <span className="font-medium">{formData.address}</span>

          <span className="text-muted-foreground">Numéro de téléphone:</span>
          <span className="font-medium">{formData.phoneNumber}</span>
        </div>

        <div className="flex gap-2 text-sm">
          <span className="text-muted-foreground">Documents:</span>
          <div className="flex gap-1">
            <DocumentStatus
              isUploaded={!!idFrontPreview}
              label="Recto pièce d'identité"
              required={true}
            />
            <DocumentStatus
              isUploaded={!!idBackPreview}
              label="Verso pièce d'identité"
              required={false}
            />
            <DocumentStatus
              isUploaded={!!selfiePreview}
              label="Selfie"
              required={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DocumentStatusProps {
  isUploaded: boolean;
  label: string;
  required: boolean;
}

const DocumentStatus = ({
  isUploaded,
  label,
  required,
}: DocumentStatusProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={`p-1 rounded ${
              isUploaded
                ? "bg-green-100 text-green-700"
                : required
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isUploaded ? (
              <Check className="h-4 w-4" />
            ) : required ? (
              <X className="h-4 w-4" />
            ) : (
              <span className="text-xs px-1">Opt.</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {label}{" "}
            {required
              ? isUploaded
                ? "téléchargé"
                : "manquant"
              : "(optionnel)"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SelfieVerificationStep;
