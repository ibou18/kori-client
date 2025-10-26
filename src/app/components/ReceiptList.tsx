/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatCurrency";
import { EmptyState } from "./EmptyState";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import {
  CloudDownload,
  FolderOpen,
  PencilIcon,
  PencilLineIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Divider, Image, message } from "antd";
import { useRouter } from "next/navigation";
import { useDeleteReceipt } from "../data/hooks";
import { useQueryClient } from "@tanstack/react-query";

import { CustomPagination } from "./CustomPagination";
import { usePagination } from "../hooks/usePagination";
import { useSearch } from "../hooks/useSearch";
import { SearchInput } from "./SearchInput";
import { OPTIONS_CATEGORIES } from "@/shared/constantes";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export function ReceiptList({ data }: { data: any }) {
  const t = useTranslations("receipt");

  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: deleteReceipt } = useDeleteReceipt();

  const handleDelete = async (id: string) => {
    try {
      await deleteReceipt(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["receipts"] });
          message.success("Reçu supprimé avec succès");
        },
        onError: (error: any) => {
          console.error("Error deleting receipt:", error);
          message.error("Erreur lors de la suppression du reçu");
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const { searchQuery, setSearchQuery, filteredData } = useSearch({
    data,
    searchKeys: ["receiptNumber", "storeName", "totalAmount", "category"], // Spécifiez les clés à rechercher
  });

  const { currentItems, currentPage, totalPages, setCurrentPage } =
    usePagination({
      data: filteredData,
      itemsPerPage: 20,
    });

  const getCategoryLabel = (categoryValue: string) => {
    const category = OPTIONS_CATEGORIES.find(
      (cat) => cat.value === categoryValue
    );
    return category ? category.label : categoryValue;
  };

  const truncateReceiptNumber = (receiptNumber: string) => {
    return receiptNumber.length > 8
      ? `${receiptNumber.slice(0, 8)}...`
      : receiptNumber;
  };

  return (
    <>
      <div className="">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full my-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher un reçu..."
              // className="max-w-md"
            />
          </div>
        </div>

        {filteredData?.length === 0 ? (
          <EmptyState
            title={t("empty.title")}
            description={t("empty.description")}
            buttontext={t("empty.button")}
            href="/admin/receipts/create"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.header.number")}</TableHead>
                  <TableHead>{t("table.header.category")}</TableHead>
                  <TableHead>{t("table.header.storeName")}</TableHead>
                  <TableHead>{t("table.header.totalAmount")}</TableHead>
                  <TableHead>{t("table.header.tps")}</TableHead>
                  <TableHead>{t("table.header.tvq")}</TableHead>
                  <TableHead>{t("table.header.tips")}</TableHead>
                  <TableHead>{t("table.header.date")}</TableHead>
                  <TableHead> </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems?.map((receipt: any) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <div className="flex space-x-4">
                        <ReceiptUrlsModal receipt={receipt}>
                          <span className="cursor-pointer hover:text-orange-500 text-blue-500 underline flex items-center gap-1">
                            <FolderOpen className="size-3" />
                            {truncateReceiptNumber(receipt.receiptNumber)}
                          </span>
                        </ReceiptUrlsModal>
                      </div>
                    </TableCell>
                    <div className="flex mt-3">
                      {getCategoryLabel(receipt.category)}
                    </div>
                    <TableCell>{receipt.storeName}</TableCell>
                    <TableCell>
                      {formatCurrency({
                        amount: receipt.totalAmount,
                        currency: "CAD",
                      })}
                    </TableCell>
                    <TableCell>
                      {formatCurrency({
                        amount: receipt.tps ?? 0,
                        currency: "CAD",
                      })}
                    </TableCell>
                    <TableCell>
                      {formatCurrency({
                        amount: receipt.tvq ?? 0,
                        currency: "CAD",
                      })}
                    </TableCell>

                    <TableCell>
                      {formatCurrency({
                        amount: receipt.tips ?? 0,
                        currency: "CAD",
                      })}
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("fr-CA", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      }).format(new Date(receipt.date))}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-between gap-x-4">
                        <PencilLineIcon
                          className="h-7 w-7 mr-3 cursor-pointer hover:text-orange-500"
                          onClick={() =>
                            router.push(`/admin/receipts/${receipt.id}`)
                          }
                        />
                        {/* <ReceiptUrlsModal receiptUrls={receipt.receiptUrl}>
                          <FolderOpen className="h-7 w-7 cursor-pointer hover:text-blue-500" />
                        </ReceiptUrlsModal> */}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Trash2Icon className="h-7 w-7 cursor-pointer text-orange-500 hover:text-red-500" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Êtes-vous sûr ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Le reçu
                                sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(receipt.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
}

function ReceiptUrlsModal({
  receipt,
  children,
}: {
  receipt: any;
  children: React.ReactNode;
}) {
  const t = useTranslations("receipt");
  const [open, setOpen] = useState(false);

  const imageFiles = receipt?.receiptUrl?.filter(
    (urlObj: any) => urlObj.type === "image"
  );
  const pdfFiles = receipt?.receiptUrl?.filter(
    (urlObj: any) => urlObj.type === "pdf"
  );

  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("modal.title")}</DialogTitle>
          <DialogDescription>
            Toutes les URLs disponibles pour ce reçu
            <div className=" flex items-center gap-2 justify-between">
              <div className="text-lg  font-black text-muted-foreground mt-3">
                Total : {receipt?.totalAmount.toFixed(2)} $
              </div>
              <div className="text-md text-muted-foreground mt-3">
                Date :{" "}
                {new Intl.DateTimeFormat("fr-CA", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                }).format(new Date(receipt.date))}
              </div>
            </div>
            <div className="text-md text-muted-foreground mt-4 flex items-center gap-2 ">
              <div>TPS : {receipt?.tps.toFixed(2)}$</div>
              {" - "}
              <div>TVQ : {receipt?.tvq.toFixed(2)}$</div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {imageFiles?.length > 0 && (
            <>
              {pdfFiles.length > 0 && (
                <>
                  <h4 className="mt-4 mb-2 font-semibold">PDFs</h4>
                  <div className="grid gap-4">
                    {pdfFiles.map((urlObj: any, index: number) => (
                      <Link
                        key={index}
                        href={urlObj.url || ""}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2"
                      >
                        <CloudDownload className="h-4 w-4" />
                        <span>PDF Document</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
              <Divider />
              <h4 className="mb-2 font-semibold">Images</h4>
              <div className="grid grid-cols-2 gap-4">
                {imageFiles?.map((urlObj: any, index: number) => (
                  <Image
                    key={index}
                    src={urlObj.url || ""}
                    alt={`Receipt Image ${index + 1}`}
                    className="rounded-md"
                  />
                ))}
              </div>
            </>
          )}

          {receipt?.receiptUrl?.length === 0 && <span>Aucun Reçu</span>}
        </div>
        <DialogFooter>
          <div className="flex justify-end gap-5">
            <Button
              type="button"
              onClick={() => router.push(`/admin/receipts/${receipt.id}`)}
            >
              Modifier Reçu
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
