"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestWrapper } from "@/config/requestsConfig";
import { DownloadCloudIcon, Loader2 } from "lucide-react";
import { message } from "antd";

interface ButtonExportProps {
  userId?: string;
  endpoint?: string;
}

export default function ButtonExport({ userId, endpoint }: ButtonExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const response = await requestWrapper.get(
        `${process.env.NEXT_API_URL}/${endpoint}/export`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const fileName = `${endpoint}-${userId}-${
        new Date().toISOString().split("T")[0]
      }.csv`;

      // Créer un lien invisible et déclencher le téléchargement
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyer l'URL
      URL.revokeObjectURL(url);
      message.success("Export réussi!");
    } catch (error: any) {
      console.error("Error during export:", error);
      message.error(
        error.response?.data?.message ||
          "Une erreur est survenue lors de l'export"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={exportCsv}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <DownloadCloudIcon className="h-4 w-4" />
      )}
      {isExporting ? "Exportation..." : "Exporter en CSV"}
    </Button>
  );
}
