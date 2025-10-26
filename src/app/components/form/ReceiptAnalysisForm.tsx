"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { message, Modal, Image } from "antd";
import { LoadingOutlined, SaveOutlined, ScanOutlined } from "@ant-design/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  OPTIONS_CATEGORIES,
  PAIMENTS_METHOD,
  VERIFICATION_STATUS,
} from "@/shared/constantes";

// Composants importés
import { UploadStep } from "../receipts/UploadStep";
import { ReceiptInfoForm } from "../receipts/ReceiptInfoForm";
import { ReceiptSummary } from "../receipts/ReceiptSummary";
import { analyzeReceipt } from "@/utils/taggun";
import { Crown, LoaderCircle } from "lucide-react";

export default function ReceiptAnalysisForm({
  initialData,
  isEditing,
  isLoading,
  checkLimit,
}: any) {
  const router = useRouter();
  const { data: session }: any = useSession();

  // États pour la gestion des fichiers
  const [file, setFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.receiptUrl?.[0]?.url || null
  );

  // États pour l'analyse et le chargement
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États du formulaire
  const [formData, setFormData] = useState({
    storeName: initialData?.storeName || "",
    receiptNumber: initialData?.receiptNumber || "",
    totalAmount: initialData?.totalAmount || "",
    date: initialData?.date
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    tps: initialData?.tps || "",
    tvq: initialData?.tvq || "",
    category: initialData?.category || OPTIONS_CATEGORIES[0].value,
    description: initialData?.description || "",
    paymentMethod: initialData?.paymentMethod || PAIMENTS_METHOD[0].value,
    verificationStatus:
      initialData?.verificationStatus || VERIFICATION_STATUS[0].value,
    tips: initialData?.tips || 0,
    tpsRate: initialData?.tpsRate || 5,
    tvqRate: initialData?.tvqRate || 9.975,
  });

  // Initialisation en mode édition
  useEffect(() => {
    if (isEditing && initialData?.receiptUrl?.length > 0) {
      // Filtrer pour n'utiliser que les URLs non-blob
      const validUrls = initialData.receiptUrl.filter(
        (item: any) => item.url && !item.url.startsWith("blob:")
      );

      if (!!initialData) {
        setFormData({
          storeName: initialData?.storeName || "",
          receiptNumber: initialData?.receiptNumber || "",
          totalAmount: initialData?.totalAmount || "",
          date: initialData?.date
            ? new Date(initialData.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          tps: initialData?.tps || "",
          tvq: initialData?.tvq || "",
          category: initialData?.category || OPTIONS_CATEGORIES[0].value,
          description: initialData?.description || "",
          paymentMethod: initialData?.paymentMethod || PAIMENTS_METHOD[0].value,
          verificationStatus:
            initialData?.verificationStatus || VERIFICATION_STATUS[0].value,
          tips: initialData?.tips || 0,
          tpsRate: initialData?.tpsRate || 5,
          tvqRate: initialData?.tvqRate || 9.975,
        });
      }

      if (validUrls.length > 0) {
        // Définir l'URL de la première image valide pour l'aperçu
        setImageUrl(validUrls[0].url);

        // Initialiser la liste des fichiers
        setFileList(
          validUrls.map((item: any) => ({
            url: item.url,
            type: item.type || "image",
            isExisting: true,
          }))
        );
      }
    }
  }, [initialData, isEditing, isLoading]);

  // Montrer la modal d'analyse quand un nouveau fichier est uploadé
  useEffect(() => {
    // Ne montrer la modal que si un nouveau fichier est uploadé (pas en mode édition avec image existante)
    if (file && !isEditing) {
      setIsAnalysisModalOpen(true);
    }
  }, [file, isEditing]);

  // Gestionnaire de changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // Créer une URL d'aperçu pour l'image avec gestion d'erreur
        const objectUrl = URL.createObjectURL(selectedFile);
        setImageUrl(objectUrl);

        // Pour un nouveau fichier, on enregistre l'objet File et l'URL
        setFileList([
          {
            originFileObj: selectedFile,
            preview: objectUrl,
            isNew: true,
          },
        ]);
      } catch (error) {
        console.error("Erreur lors du traitement du fichier:", error);
        message.error(
          "Impossible de traiter ce fichier. Veuillez réessayer avec un autre format."
        );
      }
    }
  };

  // Calcul du sous-total
  const calculateSubtotal = () => {
    const total = parseFloat(formData.totalAmount as string) || 0;
    const tps = parseFloat(formData.tps as string) || 0;
    const tvq = parseFloat(formData.tvq as string) || 0;
    const tips = parseFloat(formData.tips as string) || 0;
    return (total - tps - tvq - tips).toFixed(2);
  };

  const parseValidDate = (dateString: string | undefined): string => {
    if (!dateString) return new Date().toISOString().split("T")[0];

    // Essayer plusieurs formats de date courants
    try {
      // Format ISO ou similaire
      const date = new Date(dateString);

      // Vérifier si la date est valide
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }

      // Format MM/DD/YYYY ou DD/MM/YYYY
      const parts = dateString.split(/[\/\-\.]/);
      if (parts.length === 3) {
        // Essayer les deux ordres possibles (mois/jour/année et jour/mois/année)
        const formats = [
          // MM/DD/YYYY
          new Date(`${parts[2]}-${parts[0]}-${parts[1]}`),
          // DD/MM/YYYY
          new Date(`${parts[2]}-${parts[1]}-${parts[0]}`),
        ];

        for (const format of formats) {
          if (!isNaN(format.getTime())) {
            return format.toISOString().split("T")[0];
          }
        }
      }

      // Format textuel (ex: "April 1, 2023")
      const textDate = new Date(Date.parse(dateString));
      if (!isNaN(textDate.getTime())) {
        return textDate.toISOString().split("T")[0];
      }
    } catch (e) {
      console.warn("Impossible de parser la date:", dateString);
    }

    // En cas d'échec, retourner la date actuelle
    return new Date().toISOString().split("T")[0];
  };

  // Gestionnaires d'événements pour le formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction utilitaire pour formater la date
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return new Date().toISOString().split("T")[0];

    try {
      // Si c'est une chaîne de date ISO (comme "2025-03-03T12:00:00.000Z")
      if (typeof dateValue === "string") {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]; // Retourne "2025-03-03"
        }
      }

      // Si c'est déjà un objet Date
      if (dateValue instanceof Date) {
        return dateValue.toISOString().split("T")[0];
      }

      // Pour tout autre format, essayer le parseValidDate
      return parseValidDate(String(dateValue));
    } catch (e) {
      console.warn("Erreur lors du formatage de la date:", e);
      return new Date().toISOString().split("T")[0];
    }
  };

  // Analyse du reçu
  const handleAnalyze = async () => {
    if (!file) {
      message.error("Veuillez d'abord sélectionner une image de reçu");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Utiliser notre fonction utilitaire pour envoyer le fichier au backend
      const result = await analyzeReceipt(file);
      setAnalysisResult(result);

      console.log("Résultat de l'analyse:", result);

      if (result) {
        // Préparation des données pour mise à jour du formulaire
        const updatedData = {
          // Utiliser le résultat ou conserver la valeur actuelle si non définie
          storeName: result.storeName || formData.storeName,
          receiptNumber: result.receiptNumber || formData.receiptNumber,

          // Pour les montants, convertir en chaîne avec 2 décimales si c'est un nombre
          totalAmount:
            typeof result.totalAmount === "number"
              ? result.totalAmount.toFixed(2)
              : result.totalAmount || formData.totalAmount,

          // Utiliser la fonction de formatage pour la date
          date: formatDate(result.date),

          // Pour TPS/TVQ, gérer les valeurs nulles ou 0
          tps:
            typeof result.tps === "number"
              ? result.tps.toFixed(2)
              : result.tps === null || result.tps === undefined
              ? "0.00"
              : result.tps || formData.tps,

          tvq:
            typeof result.tvq === "number"
              ? result.tvq.toFixed(2)
              : result.tvq === null || result.tvq === undefined
              ? "0.00"
              : result.tvq || formData.tvq,

          // Pour la catégorie et le mode de paiement, utiliser des valeurs par défaut si nécessaire
          category:
            result.category || formData.category || OPTIONS_CATEGORIES[0].value,
          paymentMethod:
            result.paymentMethod ||
            formData.paymentMethod ||
            PAIMENTS_METHOD[0].value,
        };

        console.log("Données formatées pour le formulaire:", updatedData);

        // Mise à jour sécurisée de l'état du formulaire
        setFormData((prev) => ({ ...prev, ...updatedData }));

        message.success("Analyse réussie !");
        setTimeout(() => {
          setIsAnalysisModalOpen(false);
        }, 1000);
      } else {
        message.warning(
          "L'analyse n'a pas donné de résultats. Veuillez remplir le formulaire manuellement."
        );
        setIsAnalysisModalOpen(false);
      }
    } catch (error) {
      console.error("Erreur d'analyse:", error);
      message.error("Erreur lors de l'analyse du reçu");
      setIsAnalysisModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (fileList.length === 0) {
      message.error("Veuillez télécharger au moins une image de reçu");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Séparation des fichiers existants et nouveaux
      const existingFiles = fileList
        .filter((file) => file.url && !file.url.startsWith("blob:"))
        .map((file) => ({
          url: file.url,
          type: file.type || "image",
        }));

      const newFiles = fileList.filter((file) => file.originFileObj);

      // 2. Création du reçu avec uniquement les fichiers existants
      const receiptData = {
        ...formData,
        userId: session?.user?.id,
        receiptUrl: existingFiles, // Uniquement les fichiers existants
        date: new Date(formData.date).toISOString(),
      };

      // 3. Déterminer l'URL et la méthode en fonction du mode
      const url = isEditing
        ? `${process.env.NEXT_API_URL}/receipts/${initialData.id}`
        : `${process.env.NEXT_API_URL}/receipts`;
      const method = isEditing ? "PUT" : "POST";

      // 4. Soumettre les données du reçu
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(receiptData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'opération");
      }

      const data = await response.json();
      const receiptId = isEditing ? initialData.id : data.data.id;

      // 5. Upload des nouveaux fichiers si nécessaire
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => {
          formData.append("files", file.originFileObj);
        });

        const uploadResponse = await fetch(
          `${process.env.NEXT_API_URL}/receipts/${receiptId}/images`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          console.error("Erreur lors de l'upload des images");
          message.warning(
            "Le reçu a été créé, mais certaines images n'ont pas pu être téléchargées."
          );
        }
      }

      message.success(
        isEditing ? "Reçu mis à jour avec succès!" : "Reçu créé avec succès!"
      );
      router.push("/admin/receipts");
    } catch (error: any) {
      console.error("Erreur:", error);

      if (error.response?.data?.upgradeRequired) {
        message.error({
          content:
            error.response.data.message ||
            "Vous avez atteint la limite de reçus de votre plan",
          duration: 6,
        });
      } else {
        message.error(
          isEditing
            ? "Échec de la mise à jour du reçu."
            : "Échec de la création du reçu."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-10 ">
        <LoaderCircle className="animate-spin mx-auto text-orange-400" />
      </div>
    );
  }
  // JSX du composant
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gray-50 border-b pb-4">
        <CardTitle className="flex items-center gap-3">
          <span className="p-1.5 rounded-md bg-primary/10">
            <ReceiptIcon className="h-5 w-5 text-primary" />
          </span>
          {isEditing ? "Modifier un reçu" : "Ajouter un nouveau reçu"}
        </CardTitle>
      </CardHeader>

      {checkLimit?.receipts.canCreate ? (
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section d'upload */}
            <div className="mb-6">
              <UploadStep handleFileChange={handleFileChange} />
            </div>

            {/* Aperçu de l'image et formulaire */}
            {imageUrl && (
              <>
                {/* Section d'aperçu de l'image */}
                <div className="mb-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <span>Aperçu du reçu</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        type="button"
                        onClick={() => setIsAnalysisModalOpen(true)}
                      >
                        <ScanOutlined className="mr-2" />
                        Analyser
                      </Button>
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                      <Image
                        height={200}
                        width={200}
                        src={imageUrl}
                        alt="Aperçu du reçu"
                        className="max-h-[200px] object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Formulaire et résumé */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3 space-y-6">
                    <ReceiptInfoForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleSelectChange={handleSelectChange}
                      calculateSubtotal={calculateSubtotal}
                    />
                  </div>

                  <div className="space-y-6 col-span-2">
                    <ReceiptSummary
                      formData={formData}
                      subtotal={calculateSubtotal()}
                      imageUrl={imageUrl}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Bouton de soumission */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingOutlined className="mr-2" spin />{" "}
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <SaveOutlined className="mr-2" />
                        {isEditing ? "Mettre à jour" : "Enregistrer"}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      ) : (
        <div className="flex items-center justify-end p-4">
          <Button
            type="button"
            onClick={() => router.push("/admin/subscriptions")}
            className="min-w-[200px]"
          >
            <Crown className="mr-2 h-4 w-4" />
            S&apos;abonner
          </Button>
        </div>
      )}

      {/* Modal d'analyse */}
      <Modal
        title="Analyser ce reçu?"
        open={isAnalysisModalOpen}
        onCancel={() => setIsAnalysisModalOpen(false)}
        footer={null}
        centered
        width={500}
      >
        <div className="py-4">
          <div className="flex justify-center mb-6">
            <Image
              src={imageUrl || ""}
              alt="Reçu à analyser"
              className="max-h-[200px] object-contain border rounded-md"
            />
          </div>

          <p className="text-gray-600 mb-6 text-center">
            Souhaitez-vous analyser ce reçu automatiquement? Notre système peut
            extraire les informations importantes comme le montant total, la TPS
            et la TVQ.
          </p>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAnalysisModalOpen(false)}
            >
              Non merci
            </Button>
            <Button
              disabled={isAnalyzing}
              onClick={handleAnalyze}
              className="min-w-[120px]"
            >
              {isAnalyzing ? (
                <>
                  <LoadingOutlined className="mr-2" spin /> Analyse...
                </>
              ) : (
                <>
                  <ScanOutlined className="mr-2" /> Analyser
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

// Icône de reçu simple
const ReceiptIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v.5" />
      <path d="M12 6.5v.5" />
    </svg>
  );
};
