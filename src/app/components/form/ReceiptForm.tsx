/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-comment-textnodes */

"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Divider, Image, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, setDate } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { InfoIcon, PlusCircle, Trash2Icon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { OPTIONS_CATEGORIES, PAIMENTS_METHOD } from "@/shared/constantes";
import { UploadListType } from "antd/es/upload/interface";
import { Switch } from "@/components/ui/switch";

interface ReceiptFormProps {
  initialData?: any;
  isEditing?: boolean;
  receiptLoading?: boolean;
}

const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;

const formatTaxRate = (rate: number | null | undefined): string => {
  // Si la valeur est 0, retourner "0"
  if (rate === 0) return "0";
  // Si la valeur est null ou undefined, retourner la valeur par défaut
  if (rate === null || rate === undefined) return "";
  return rate.toString();
};

export function ReceiptForm({
  initialData,
  isEditing = false,
  receiptLoading,
}: ReceiptFormProps) {
  const { data: session }: any = useSession();
  const router = useRouter();

  // Mettre à jour les taux avec conversion de type
  const [tpsRate, setTpsRate] = useState<string>("");
  const [tvqRate, setTvqRate] = useState<string>("");

  /** États */
  //   const timeStamp = format(new Date(), "yyyyMMddHHmmss");
  const [formData, setFormData] = useState({
    receiptNumber: "",
    storeName: "",
    category: "RESTAURANT",
    paymentMethod: "CREDIT_CARD",
    date: new Date(),
    items: [{ name: "", quantity: 1, price: null }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [fileList, setFileList] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<any>(new Date());

  const [category, setCategory] = useState("ESSENCE");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [tips, setTips] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    title: string;
    type: string;
  }>({ url: "", title: "", type: "" });

  // Ajouter les états pour les switches
  const [tpsEnabled, setTpsEnabled] = useState(() => {
    if (isEditing && initialData) {
      return initialData.tpsRate > 0;
    }
    return true;
  });

  const [tvqEnabled, setTvqEnabled] = useState(() => {
    if (isEditing && initialData) {
      return initialData.tvqRate > 0;
    }
    return true;
  });

  useEffect(() => {
    if (isEditing && initialData) {
      // Si c'est de l'essence, désactiver les taxes
      if (initialData.category === "ESSENCE") {
        setTpsEnabled(false);
        setTvqEnabled(false);
        setTpsRate("0");
        setTvqRate("0");
      } else {
        setTpsRate(formatTaxRate(initialData.tpsRate || initialData.tps));
        setTvqRate(formatTaxRate(initialData.tvqRate || initialData.tvq));
        setTpsEnabled(initialData.tpsRate > 0 || initialData.tps > 0);
        setTvqEnabled(initialData.tvqRate > 0 || initialData.tvq > 0);
      }
    } else {
      // Pour un nouveau reçu
      if (category === "ESSENCE") {
        setTpsEnabled(false);
        setTvqEnabled(false);
        setTpsRate("0");
        setTvqRate("0");
      } else {
        setTpsRate(TPS_RATE.toString());
        setTvqRate(TVQ_RATE.toString());
        setTpsEnabled(true);
        setTvqEnabled(true);
      }
    }
  }, [initialData, isEditing, category]);

  // Charger les données initiales si en mode édition
  useEffect(() => {
    if (isEditing && initialData) {
      // Initialiser avec les valeurs de initialData ou les valeurs par défaut
      setCategory(initialData.category);
      setCurrentDate(new Date(initialData.date));
      setFormData({
        receiptNumber: initialData.receiptNumber,
        storeName: initialData.storeName || "",
        category: initialData.category,
        paymentMethod: initialData.paymentMethod || "CREDIT_CARD",
        date: initialData.date ? new Date(initialData.date) : new Date(),
        items: initialData.items || [{ name: "", quantity: 1, price: 0 }],
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
      // Initialiser avec les valeurs par défaut seulement si pas en mode édition
      setTpsRate(TPS_RATE.toString());
      setTvqRate(TVQ_RATE.toString());
    }
  }, [initialData, isEditing, receiptLoading]);

  useEffect(() => {
    if (category === "ESSENCE") {
      setTpsEnabled(false);
      setTvqEnabled(false);
      setTpsRate("0");
      setTvqRate("0");
    } else if (!isEditing) {
      // Ne réinitialiser que si on n'est pas en mode édition
      setTpsEnabled(true);
      setTvqEnabled(true);
      setTpsRate(TPS_RATE.toString());
      setTvqRate(TVQ_RATE.toString());
    }
  }, [category, isEditing]);

  /** Calculs */
  const subtotal = useMemo(
    () =>
      formData.items.reduce(
        (total, item: any) => total + item.quantity * item.price,
        0
      ),
    [formData.items]
  );

  const { tps, tvq } = useMemo(
    () => ({
      tps: includeTaxes ? subtotal * Number(tpsRate) : 0,
      tvq: includeTaxes ? subtotal * Number(tvqRate) : 0,
    }),
    [subtotal, includeTaxes, tpsRate, tvqRate]
  );

  /** Handlers */
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    handleFormChange("items", [
      ...formData.items,
      { name: "", quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    handleFormChange("items", newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    handleFormChange("items", newItems);
  };

  /** Handlers */

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
            return {
              ...file,
              status: "done",
              type: file.type || "image",
            };
          }
          if (file.originFileObj) {
            return {
              ...file,
              preview: URL.createObjectURL(file.originFileObj),
              type: file.originFileObj.type || "image",
            };
          }
          return null;
        })
        .filter(Boolean); // Enlever les entrées null

      setFileList(validFiles);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (fileList.length === 0) {
      message.error("Plesae upload at least one file");
      return;
    }

    if (formData.items[0].price === null || formData.items[0].price === 0) {
      message.error("Please enter a price for the first item");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log("formData", formData);

    try {
      const validFiles = fileList
        .filter(
          (file) => (file.url && file.url.length > 0) || file.originFileObj
        )
        .map((file) => ({
          url: file.url || "", // sera remplacé par l'URL S3 pour les nouveaux fichiers
          type: file.type || "image",
        }))
        .filter((file) => file.url !== ""); // Filtrer les URLs vides

      const receiptData = {
        ...formData,
        userId: session?.user?.id,
        category: category,
        receiptUrl: validFiles,
        date: currentDate.toISOString(),
        totalAmount: subtotal + tps + tvq,
        tps,
        tvq,
        tva: 0,
        tpsRate: Number(tpsRate), // Assurez-vous que c'est un nombre
        tvqRate: Number(tvqRate),
        tips: tips,
      };

      // Déterminer l'URL et la méthode en fonction du mode
      const url = isEditing
        ? `${process.env.NEXT_API_URL}/receipts/${initialData.id}`
        : `${process.env.NEXT_API_URL}/receipts`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptData),
      });

      if (!response.ok) throw new Error("Erreur lors de l'opération");

      const data = await response.json();
      console.log("data", data);

      // Gérer l'upload des fichiers si nécessaire
      if (fileList.length > 0) {
        const newFiles = fileList.filter((file) => file.originFileObj);
        if (newFiles.length > 0) {
          const formData = new FormData();
          newFiles.forEach((file) => {
            formData.append("files", file.originFileObj);
          });

          const uploadResponse = await fetch(
            `${process.env.NEXT_API_URL}/receipts/${
              isEditing ? initialData.id : data.data.id
            }/images`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            throw new Error("Erreur lors de l'upload des images");
          }
        }
      }

      message.success(
        isEditing ? "Reçu mis à jour avec succès!" : "Reçu créé avec succès!"
      );
      router.push("/admin/receipts");
    } catch (error) {
      console.error("Erreur:", error);
      message.error(
        isEditing
          ? "Échec de la mise à jour du reçu."
          : "Échec de la création du reçu."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = (fileToRemove: any) => {
    setFileList(fileList.filter((file) => file.uid !== fileToRemove.uid));
  };

  // Simplification des handlers pour les switches
  const handleTpsToggle = (checked: boolean) => {
    if (category === "ESSENCE") return;
    setTpsEnabled(checked);
    setTpsRate(checked ? TPS_RATE.toString() : "0");
  };

  const handleTvqToggle = (checked: boolean) => {
    if (category === "ESSENCE") return;
    setTvqEnabled(checked);
    setTvqRate(checked ? TVQ_RATE.toString() : "0");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form className="space-y-6">
          <div className="lg:flex justify-between lg:space-x-6 space-y-4 lg:space-y-0">
            {/* Numéro de reçu */}
            <div className="lg:w-1/2">
              <Label># Receipt</Label>
              <Input
                value={formData.receiptNumber}
                readOnly={isEditing}
                disabled={isEditing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receiptNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="lg:w-1/2">
              <Label>Paiement Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAIMENTS_METHOD.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Store Name */}
          <div className="lg:flex justify-between lg:space-x-6 space-y-4 lg:space-y-0">
            {/* Catégorie */}
            <div className="lg:w-1/2">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTIONS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="lg:w-1/2">
              <Label>Store Name</Label>
              <Input
                value={formData.storeName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    storeName: e.target.value,
                  })
                }
                placeholder="Nom du commerce"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-x-4">
            <Label>Date : </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-3/4 lg:w-2/5" variant="outline">
                  {format(currentDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="w-1/2">
            <Label className="mb-1 italic">Total Tips </Label>
            <Input
              type="number"
              placeholder="Tips"
              value={tips}
              onChange={(e) => setTips(Number(e.target.value))}
            />
          </div>

          {/* Articles */}
          <div>
            <div className="mb-2">
              <Label className="font-bold">Articles</Label>
            </div>
            {formData.items.map((item, index) => (
              <div key={index} className="grid lg:grid-cols-12 gap-4 mb-4">
                <div className="flex flex-col lg:col-span-6 col-span-3">
                  <Label className="mb-1 italic">Description</Label>

                  <Input
                    placeholder="Description"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col col-span-3 lg:col-span-1">
                  <Label className="mb-1 italic">Qty </Label>
                  <Input
                    type="number"
                    placeholder="Quantité"
                    value={item.quantity}
                    min={1}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="flex flex-col col-span-3 lg:col-span-2">
                  <div className="flex items-center gap-x-2">
                    <Label className="mb-1 italic">Price </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <InfoIcon size={15} />
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4 text-xs">
                          Total Price before taxes
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="Price"
                    value={item.price || ""}
                    onChange={(e) =>
                      handleItemChange(index, "price", Number(e.target.value))
                    }
                    className="text-right"
                  />
                </div>

                <div className="lg:mt-4 gap-2  mt-[16px] flex flex-rows justify-between ">
                  <Label className="mb-1 italic"></Label>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                  {/* Afficher le bouton seulement sur le dernier item */}
                  {index === formData.items.length - 1 && (
                    <Button type="button" onClick={addItem}>
                      <PlusCircle className="h-4 w-4 mr-1" /> article
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {category === "ESSENCE" && (
              <div className="text-sm text-muted-foreground  mt-2 text-red-500">
                ⚠️ Taxes are included for gas receipts fill total amount
              </div>
            )}
            <Divider />
          </div>

          {/* Taxes et Total */}
          <div className="space-y-4 sm:space-y-2">
            {/* Subtotal */}
            <div className="grid grid-cols-24  sm:grid-cols-12 items-center">
              <div className="col-span-6 sm:col-span-8" />
              <div className="col-span-3 sm:col-span-2 text-right">
                SubTotal :
              </div>
              <div className="col-span-3 sm:col-span-2 text-right">
                {subtotal.toFixed(2)} $
              </div>
            </div>

            {/* TPS */}
            <div className="grid grid-cols-24  sm:grid-cols-12 items-center">
              <div className="col-span-12 sm:col-span-8" />
              <div className="col-span-6 sm:col-span-2">
                <div className="flex flex-row sm:flex-row items-end sm:items-center justify-end gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        tpsEnabled ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      TPS
                    </span>
                    <Switch
                      checked={tpsEnabled}
                      onChange={handleTpsToggle}
                      className="scale-75 sm:scale-100"
                      disabled={category === "ESSENCE"}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-medium">
                      {tpsEnabled ? "(5%)" : "(0%)"}
                    </span>
                    <span>:</span>
                  </div>
                </div>
              </div>
              <div className="col-span-6 sm:col-span-2 text-right">
                {tps.toFixed(2)} $
              </div>
            </div>

            {/* TVQ */}
            <div className="grid grid-cols-24  sm:grid-cols-12 items-center">
              <div className="col-span-12 sm:col-span-8" />
              <div className="col-span-6 sm:col-span-2">
                <div className="flex flex-row sm:flex-row items-end sm:items-center justify-end gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        tvqEnabled ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      TVQ
                    </span>
                    <Switch
                      checked={tvqEnabled}
                      onChange={handleTvqToggle}
                      className="scale-75 sm:scale-100"
                      disabled={category === "ESSENCE"}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-medium">
                      {tvqEnabled ? "(9.975%)" : "(0%)"}
                    </span>
                    <span>:</span>
                  </div>
                </div>
              </div>
              <div className="col-span-3 sm:col-span-2 text-right">
                {tvq.toFixed(2)} $
              </div>
            </div>

            {/* Total */}
            <div className="grid grid-cols-12 items-center border-t pt-2">
              <div className="col-span-6 sm:col-span-8" />
              <div className="col-span-3 sm:col-span-2 text-right font-bold">
                Total :
              </div>
              <div className="col-span-3 sm:col-span-2 text-right font-bold">
                {(subtotal + tps + tvq + tips).toFixed(2)} $
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className="space-x-2">
            <Label>Files: </Label>
            <Upload
              fileList={fileList}
              {...uploadProps}
              className="upload-list-inline"
            >
              <Button type="button">
                <UploadOutlined className="mr-2 ml-2" />
                Select Files
              </Button>
            </Upload>
          </div>
        </form>
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
