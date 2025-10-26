import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScanText, AlertCircle } from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";
import Image from "next/image";

interface ImagePreviewStepProps {
  imageUrl: string | null;
  handleAnalyze: () => void;
  isAnalyzing: boolean;
  file: File | null;
  analysisCompleted: boolean;
}

export function ImagePreviewStep({
  imageUrl,
  handleAnalyze,
  isAnalyzing,
  file,
  analysisCompleted,
}: ImagePreviewStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Réinitialiser les états si l'URL change
  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [imageUrl]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <ScanText className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-lg font-medium">Prévisualisation du reçu</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md overflow-hidden bg-gray-50 min-h-[300px] flex items-center justify-center">
          {isLoading && !hasError && imageUrl && (
            <div className="text-center py-12">
              <LoadingOutlined className="text-3xl text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Chargement...</p>
            </div>
          )}

          {hasError && (
            <div className="text-center py-12 px-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-600 font-medium">Image non disponible</p>
              <p className="text-sm text-gray-500 mt-1">
                L&apos;image ne peut pas être affichée.
              </p>
            </div>
          )}

          {imageUrl && !hasError && (
            <Image
              height={400}
              width={400}
              src={imageUrl}
              alt="Aperçu du reçu"
              className="max-h-[400px] object-contain"
              onLoad={() => setIsLoading(false)}
              onError={(e) => {
                console.error("Erreur de chargement d'image:", e);
                setHasError(true);
                setIsLoading(false);
              }}
              style={isLoading ? { display: "none" } : {}}
            />
          )}
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h4 className="font-medium text-lg mb-2">Analyse automatique</h4>
            <p className="text-gray-600 text-sm">
              Notre système peut analyser automatiquement le contenu de votre
              reçu pour extraire les informations importantes.
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !file || hasError}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <LoadingOutlined className="mr-2" spin /> Analyse en cours...
              </>
            ) : analysisCompleted ? (
              <>
                <ScanText className="mr-2" /> Analyser à nouveau
              </>
            ) : (
              <>
                <ScanText className="mr-2" /> Analyser ce reçu
              </>
            )}
          </Button>

          {analysisCompleted && (
            <div className="p-3 bg-green-50 border border-green-100 rounded-md">
              <p className="text-green-600 text-sm">
                ✓ Analyse complétée. Les informations ont été remplies
                automatiquement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
