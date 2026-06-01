"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestWrapper } from "@/config/requestsConfig";
import { DownloadCloudIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type ExportQueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

interface ButtonExportProps {
  /** Chemin relatif sans slash initial, ex. `salons`, `user`, `bookings/payments` */
  endpoint: string;
  exportParams?: ExportQueryParams;
  fileNamePrefix?: string;
  label?: string;
  className?: string;
}

/** Chemin relatif aligné sur requestWrapper (ex. `/bookings/export`). */
function buildExportPath(
  endpoint: string,
  exportParams?: ExportQueryParams
): string {
  const normalized = endpoint.replace(/^\/+|\/+$/g, "");
  const base = `/${normalized}/export`;
  if (!exportParams) return base;

  const search = new URLSearchParams();
  Object.entries(exportParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

export default function ButtonExport({
  endpoint,
  exportParams,
  fileNamePrefix,
  label = "Exporter en CSV",
  className,
}: ButtonExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const response = await requestWrapper.get(
        buildExportPath(endpoint, exportParams),
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split("T")[0];
      const prefix = fileNamePrefix ?? endpoint.replace(/\//g, "-");
      const fileName = `${prefix}-${date}.csv`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.success("Export réussi !");
    } catch (error: unknown) {
      console.error("Error during export:", error);
      const err = error as {
        response?: { status?: number; data?: Blob | { message?: string } };
      };
      let errorMessage = "Une erreur est survenue lors de l'export";

      if (err.response?.status === 404) {
        errorMessage =
          "Export indisponible : mettez à jour le serveur API (route /export manquante).";
      } else if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text) as {
            message?: string;
            error?: { message?: string };
          };
          errorMessage =
            parsed.error?.message ||
            parsed.message ||
            errorMessage;
        } catch {
          // ignore parse errors
        }
      } else if (
        err.response?.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        errorMessage = String(err.response.data.message);
      }

      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={exportCsv}
      disabled={isExporting}
      className={className ?? "gap-2"}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <DownloadCloudIcon className="h-4 w-4" />
      )}
      {isExporting ? "Exportation..." : label}
    </Button>
  );
}
