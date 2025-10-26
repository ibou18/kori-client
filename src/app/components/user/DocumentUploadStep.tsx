/* eslint-disable react/no-unescaped-entities */
import { MutableRefObject } from "react";
import { Info } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface DocumentUploadStepProps {
  idFrontRef: MutableRefObject<File | null>;
  idBackRef: MutableRefObject<File | null>;
  idFrontPreview: string | null;
  idBackPreview: string | null;
  setIdFrontPreview: (url: string | null) => void;
  setIdBackPreview: (url: string | null) => void;
  handleFileUpload: (
    file: File | null,
    setPreview: (url: string | null) => void,
    fileRef: React.MutableRefObject<File | null>
  ) => void;
}

const DocumentUploadStep = ({
  idFrontRef,
  idBackRef,
  idFrontPreview,
  idBackPreview,
  setIdFrontPreview,
  setIdBackPreview,
  handleFileUpload,
}: DocumentUploadStepProps) => {
  return (
    <div className="space-y-6">
      {/* Message informatif moins contraignant */}
      <div className="bg-blue-50 text-blue-800 rounded-md p-3 flex items-start">
        <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p>
            Veuillez télécharger des photos claires et lisibles de votre pièce
            d'identité.
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Formats acceptés : JPG, PNG ou PDF (max 5MB)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUploader
          id="idFront"
          label="Recto de la pièce d'identité"
          description="Face avant de votre carte d'identité, passeport ou permis de conduire."
          accept="image/jpeg,image/png,application/pdf"
          preview={idFrontPreview}
          fileRef={idFrontRef}
          setPreview={setIdFrontPreview}
          handleFileUpload={handleFileUpload}
          required={true}
        />

        <ImageUploader
          id="idBack"
          label="Verso de la pièce d'identité"
          labelExtra="(optionnel)"
          description="Face arrière de votre carte d'identité ou permis de conduire."
          accept="image/jpeg,image/png,application/pdf"
          preview={idBackPreview}
          fileRef={idBackRef}
          setPreview={setIdBackPreview}
          handleFileUpload={handleFileUpload}
          required={false}
        />
      </div>
    </div>
  );
};

export default DocumentUploadStep;
