"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Store, CreditCard, Tag } from "lucide-react";
import { Image } from "antd";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OPTIONS_CATEGORIES, PAIMENTS_METHOD } from "@/shared/constantes";

interface ReceiptSummaryProps {
  formData: {
    storeName: string;
    receiptNumber: string;
    totalAmount: string | number;
    date: string;
    tps: string | number;
    tvq: string | number;
    category: string;
    paymentMethod: string;
    tips: string | number;
    description?: string;
  };
  subtotal: string;
  imageUrl: string | null;
}

export const ReceiptSummary = ({
  formData,
  subtotal,
  imageUrl,
}: ReceiptSummaryProps) => {
  const safeFormData = {
    storeName: formData?.storeName || "",
    receiptNumber: formData?.receiptNumber || "",
    totalAmount: formData?.totalAmount || 0,
    date: formData?.date || new Date().toISOString().split("T")[0],
    tps: formData?.tps || 0,
    tvq: formData?.tvq || 0,
    category: formData?.category || "",
    paymentMethod: formData?.paymentMethod || "",
    tips: formData?.tips || 0,
    description: formData?.description || "",
  };

  // Fonction pour formatter les montants en devise
  const formatCurrency = (amount: string | number) => {
    const num = Number(amount);
    return isNaN(num) ? "0,00 $" : `${num.toFixed(2).replace(".", ",")} $`;
  };

  // Obtenir les labels pour les valeurs sélectionnées
  const getCategoryLabel = (value: string) => {
    return (
      OPTIONS_CATEGORIES.find((cat) => cat.value === value)?.label || value
    );
  };

  const getPaymentMethodLabel = (value: string) => {
    return (
      PAIMENTS_METHOD.find((method) => method.value === value)?.label || value
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <CardTitle className="text-lg">Résumé du reçu</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Image du reçu */}
        {imageUrl && (
          <div className="mb-4">
            <div className="relative w-full h-40 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
              <Image
                src={imageUrl}
                alt="Reçu"
                // fill
                className="object-contain p-2"
              />
            </div>
          </div>
        )}

        {/* Informations principales */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Store className="w-5 h-5 text-gray-500 mr-2" />
            <span className="font-medium">
              {safeFormData.storeName || "Non spécifié"}
            </span>
          </div>

          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 text-gray-500 mr-2" />
            <span>
              {new Date(safeFormData.date).toLocaleDateString("fr-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {safeFormData.receiptNumber && (
            <div className="flex items-center">
              <span className="text-gray-500 w-5 h-5 mr-2 flex items-center justify-center">
                #
              </span>
              <span className="font-mono">{safeFormData.receiptNumber}</span>
            </div>
          )}

          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
            <span>{getPaymentMethodLabel(safeFormData.paymentMethod)}</span>
          </div>

          <div className="flex items-center">
            <Tag className="w-5 h-5 text-gray-500 mr-2" />
            <Badge variant="outline" className="font-normal">
              {getCategoryLabel(safeFormData.category)}
            </Badge>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Détails financiers */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Sous-total:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {Number(safeFormData.tps) > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">TPS:</span>
              <span>{formatCurrency(safeFormData.tps)}</span>
            </div>
          )}

          {Number(safeFormData.tvq) > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">TVQ:</span>
              <span>{formatCurrency(safeFormData.tvq)}</span>
            </div>
          )}

          {Number(safeFormData.tips) > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Pourboire:</span>
              <span>{formatCurrency(safeFormData.tips)}</span>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between items-center font-medium">
            <span>Total:</span>
            <span className="text-lg">
              {formatCurrency(safeFormData.totalAmount)}
            </span>
          </div>
        </div>

        {/* Description / Note supplémentaire */}
        {safeFormData.description && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic">
              {safeFormData.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReceiptSummary;
