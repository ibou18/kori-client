/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-comment-textnodes */

"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Image, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

import { Card, CardContent } from "@/components/ui/card";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { UploadListType } from "antd/es/upload/interface";
import { ReceiptHeader } from "../receipts/ReceiptHeader";
import ReceiptOtherTaxe from "../receipts/ReceiptOtherTaxe";
import { VERIFICATION_STATUS } from "@/shared/constantes";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReceiptFormProps {
  initialData?: any;
  isEditing?: boolean;
  receiptLoading?: boolean;
  mode?: string;
}

const TPS_RATE = 5;
const TVQ_RATE = 9.975;

const formatTaxRate = (rate: number | null | undefined): string => {
  // Si la valeur est 0, retourner "0"
  if (rate === 0) return "0";
  // Si la valeur est null ou undefined, retourner la valeur par défaut
  if (rate === null || rate === undefined) return "";
  return rate.toString();
};

export default function ReceiptFormNew({
  initialData,
  isEditing = false,
  receiptLoading,
  mode,
}: ReceiptFormProps) {
  const { data: session }: any = useSession();
  const router = useRouter();

  // Mettre à jour les taux avec conversion de type
  const [tpsRate, setTpsRate] = useState<string>(TPS_RATE.toString());
  const [tvqRate, setTvqRate] = useState<string>(TVQ_RATE.toString());
  const [totalAmountReceipt, setTotalAmountReceipt] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [formData, setFormData] = useState<any>({});
  const [verificationStatus, setVerificationStatus] = useState<string>(
    VERIFICATION_STATUS[0].value
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<any>(new Date());
  const [isImageLoading, setIsImageLoading] = useState(false);

  const [category, setCategory] = useState(
    initialData?.category ? initialData?.category : "ESSENCE"
  );
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [tips, setTips] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    title: string;
    type: string;
  }>({ url: "", title: "", type: "" });

  const [imageUrl, setImageUrl] = useState<string>("");

  console.log("initialData", initialData);
  // Charger les données initiales si en mode édition
  useEffect(() => {
    if (mode === "edit" && initialData) {
      // Initialiser avec les valeurs de initialData ou les valeurs par défaut
      setCategory(initialData.category);
      setCurrentDate(new Date(initialData.date));
      setPaymentMethod(initialData.paymentMethod);
      setTips(initialData.tips);
      setDescription(initialData.description);
      setTotalAmountReceipt(initialData.totalAmount.toFixed(2));
      // Ajout de l'initialisation explicite des taux de taxes
      setTpsRate(initialData.tpsRate);
      setTvqRate(initialData.tvqRate);
      setVerificationStatus(initialData.verificationStatus);

      setFormData({
        ...initialData,
        date: new Date(initialData.date),
        totalAmount: initialData.totalAmount,
        tps: initialData.tps,
        tvq: initialData.tvq,
        tva: initialData.tva,
        tpsRate: initialData.tpsRate,
        tvqRate: initialData.tvqRate,
        tips: initialData.tips,
      });

      if (initialData.receiptUrl && initialData.receiptUrl.length > 0) {
        setFileList(
          initialData.receiptUrl.map((file: any, index: number) => ({
            uid: `-${index}`,
            name: `Receipt ${index + 1}`,
            status: "done",
            url: file.url,
            type: file.type || "image", // Ajout d'un type par défaut
          }))
        );
      }
    } else {
      return;
    }
  }, [initialData, isEditing, receiptLoading]);

  // Ajoutez cette fonction utilitaire
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadProps = {
    beforeUpload: () => false,
    onChange: ({ fileList: newFileList }: any) => {
      const validFiles = newFileList
        .filter((file: any) => {
          // Garder uniquement les fichiers avec une URL valide ou un fichier à uploader
          return (file.url && file.url.length > 0) || file.originFileObj;
        })
        .map((file: any) => {
          if (file.url) {
            // Mettre à jour imageUrl avec la première URL valide
            if (!imageUrl) setImageUrl(file.url);
            return {
              ...file,
              status: "done",
              type: file.type || "image",
            };
          }
          if (file.originFileObj) {
            const preview = URL.createObjectURL(file.originFileObj);
            // Mettre à jour imageUrl avec le premier aperçu
            if (!imageUrl) setImageUrl(preview);
            return {
              ...file,
              preview,
              type: file.originFileObj.type || "image",
            };
          }
          return null;
        })
        .filter(Boolean);

      setFileList(validFiles);

      // Si la liste a changé et qu'il y a au moins un fichier, mettre à jour imageUrl
      if (validFiles.length > 0) {
        setImageUrl(validFiles[0].url || validFiles[0].preview || "");
      } else {
        setImageUrl("");
      }
    },
    multiple: true,
    listType: "picture" as UploadListType,
    onPreview: async (file: any) => {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      setPreviewFile({
        url: file.url || file.preview,
        title: file.name || "Fichier",
        type: file.type || "image",
      });
      setPreviewOpen(true);
    },
  };

  // Fonction de soumission refactorisée
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Vérifier s'il y a au moins un fichier
    if (fileList.length === 0) {
      message.error("Veuillez télécharger au moins un fichier");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Séparer les fichiers existants des nouveaux fichiers
      const existingFiles = fileList
        .filter((file) => file.url && !file.url.startsWith("blob:"))
        .map((file) => ({
          url: file.url,
          type: file.type || "image",
        }));

      const newFiles = fileList.filter((file) => file.originFileObj);

      // 1. Création du reçu avec uniquement les fichiers existants
      const receiptData = {
        ...formData,
        userId: session?.user?.id,
        receiptUrl: existingFiles, // Uniquement les fichiers existants
        date: new Date(formData.date).toISOString(),
      };

      // Déterminer l'URL et la méthode en fonction du mode
      const url = isEditing
        ? `${process.env.NEXT_API_URL}/receipts/${initialData.id}`
        : `${process.env.NEXT_API_URL}/receipts`;
      const method = isEditing ? "PUT" : "POST";

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

      // 2. Upload des nouveaux fichiers si nécessaire
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
          // Si l'upload échoue, continuez tout de même car le reçu existe déjà
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

  const initializeFileList = (receiptUrls: any[] | undefined) => {
    if (!receiptUrls || receiptUrls.length === 0) {
      return [];
    }

    return receiptUrls
      .filter((item) => item.url && !item.url.startsWith("blob:"))
      .map((item, index) => ({
        uid: `-${index}`,
        name: `Receipt ${index + 1}`,
        status: "done",
        url: item.url,
        type: item.type || "image",
      }));
  };

  // Dans useEffect pour l'initialisation
  useEffect(() => {
    if (isEditing && initialData) {
      // Initialiser la liste des fichiers
      setFileList(initializeFileList(initialData.receiptUrl));

      // Définir l'URL de l'image pour l'aperçu
      if (initialData.receiptUrl && initialData.receiptUrl.length > 0) {
        const validUrl = initialData.receiptUrl.find(
          (item: any) => item.url && !item.url.startsWith("blob:")
        );
        if (validUrl) {
          setImageUrl(validUrl.url);
        }
      }
    }
  }, [isEditing, initialData]);

  const handleRemoveFile = (fileToRemove: any) => {
    const updatedFileList = fileList.filter(
      (file) => file.uid !== fileToRemove.uid
    );
    setFileList(updatedFileList);

    // Mettre à jour imageUrl si le fichier supprimé était celui affiché
    if (updatedFileList.length > 0) {
      setImageUrl(updatedFileList[0].url || updatedFileList[0].preview || "");
    } else {
      setImageUrl("");
    }
  };

  const handleChangeTPS = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTpsRate(e.target.value);
  };

  const handleChangeTVQ = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTvqRate(e.target.value);
  };

  const handleDescription = (value: string) => {
    setDescription(value);
  };

  const handleTotal = (value: string) => {
    setTotalAmountReceipt(Number(value));
  };

  const taxes = useMemo(() => {
    if (!totalAmountReceipt) {
      return {
        subTotal: 0,
        tps: 0,
        tvq: 0,
        total: 0,
      };
    }

    const tpsRateNum = Number(tpsRate) / 100;
    const tvqRateNum = Number(tvqRate) / 100;

    // On part du total et on calcule les taxes
    const total = Number(totalAmountReceipt);

    // Calcul du montant hors taxes
    const divisionFactor = 1 + tpsRateNum + tvqRateNum;
    const subTotal = total / divisionFactor;

    // Calcul des taxes
    const calculatedTps = subTotal * tpsRateNum;
    const calculatedTvq = subTotal * tvqRateNum;

    return {
      subTotal: Number(subTotal.toFixed(2)),
      tps: Number(calculatedTps.toFixed(2)),
      tvq: Number(calculatedTvq.toFixed(2)),
      total: Number(totalAmountReceipt), // On garde le montant total original
    };
  }, [totalAmountReceipt, tpsRate, tvqRate]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6  space-y-6 grid grid-cols-1 lg:grid-cols-2 gap-x-3">
        <div>
          <div className="space-x-2 mb-5">
            <Label>Fichier: </Label>
            <Upload
              fileList={fileList}
              {...uploadProps}
              className="upload-list-inline"
            >
              <Button type="button">
                <UploadOutlined className="mr-2 ml-2" />
                Sélectionner un fichier
              </Button>
            </Upload>
          </div>{" "}
          <form className="space-y-6">
            <ReceiptHeader
              formData={formData}
              setFormData={setFormData}
              isEditing={isEditing}
              category={category}
              setCategory={setCategory}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              setVerificationStatus={setVerificationStatus}
              verificationStatus={verificationStatus}
            />

            <ReceiptOtherTaxe
              tps={taxes.tps}
              tvq={taxes.tvq}
              // subtotal={subtotal}
              tips={tips}
              setTips={setTips}
              total={taxes.total}
              category={category}
              tpsRate={tpsRate}
              tvqRate={tvqRate}
              handleChangeTPS={handleChangeTPS}
              handleChangeTVQ={handleChangeTVQ}
              handleDescription={handleDescription}
              description={description}
              totalAmountReceipt={totalAmountReceipt}
              setTotalAmountReceipt={setTotalAmountReceipt}
            />

            {/* Upload */}
          </form>
        </div>
        <div>
          <Image
            src={fileList[0]?.url || fileList[0]?.preview || ""}
            alt="Receipt"
            className="max-w-full max-h-full object-contain rounded-lg"
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
            style={isImageLoading ? { display: "none" } : {}}
          />
          {isImageLoading && (
            <div className="h-80 w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        <div className="border-b mt-0 pt-4 w-full" />
        <div className="flex items-center justify-between space-x-4 mt-2">
          <Button
            variant="destructive"
            disabled={isSubmitting}
            className="lg:w-1/2"
            onClick={() => router.push("/admin/receipts")}
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => handleSubmit(e as any)}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting
              ? isEditing
                ? "update in Progress..."
                : "creation in Progress..."
              : isEditing
              ? "Update Receipt"
              : "Create Receipt"}
          </Button>
        </div>
      </CardContent>

      {/* Ajoutez la modal de prévisualisation */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent
          side="right"
          className="w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[50%]"
        >
          <SheetHeader className="mb-4">
            <SheetTitle>{previewFile.title}</SheetTitle>
            <SheetDescription>
              {previewFile.type.includes("pdf") ? "Document PDF" : "Image"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-[calc(100vh-120px)]">
            {previewFile.type.includes("pdf") ? (
              <iframe
                src={`${previewFile.url}#view=FitH`}
                className="w-full h-full border-0"
                title={previewFile.title}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Image
                  src={previewFile.url}
                  alt={previewFile.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
