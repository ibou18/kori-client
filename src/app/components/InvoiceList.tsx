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
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";
import { CloudDownload, Package } from "lucide-react";

import Link from "next/link";
import { InvoiceActions } from "./InvoiceActions";
import { StatusChangePopup } from "./StatusChangePopup";
import { useGetInvoices } from "../data/hooksHop";
import { CustomPagination } from "./CustomPagination";
import { useSearch } from "../hooks/useSearch";
import { SearchInput } from "./SearchInput";
import { useTranslations } from "next-intl";
import { InvoiceStatus } from "../interfaceHop";
import { useState, useEffect } from "react";

export function InvoiceList({ data: initialData }: { data: any }) {
  const t = useTranslations("invoice");

  // État local pour gérer les filtres de pagination et recherche
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    searchTerm: "",
  });

  // Utiliser useGetInvoices avec les filtres actuels
  const { data, refetch, isLoading } = useGetInvoices(filters);

  // Extraction des factures et des informations de pagination
  const invoices = (data || initialData)?.invoices || [];
  const paginationInfo = (data || initialData)?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  };

  // Fonction pour gérer le changement de page
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Fonction pour gérer la recherche
  const handleSearch = (searchValue: string) => {
    // Réinitialiser la page à 1 lors d'une nouvelle recherche
    setFilters((prev) => ({
      ...prev,
      page: 1,
      searchTerm: searchValue,
    }));
  };

  // Fonction pour obtenir une couleur basée sur le statut
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800";
      case "CANCELED":
        return "bg-gray-100 text-gray-800";
      case "DRAFT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full">
            <SearchInput
              value={filters.searchTerm}
              onChange={handleSearch}
              placeholder={t("search.placeholder")}
              className="w-full mb-4"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !invoices || invoices.length === 0 ? (
          <EmptyState
            title={t("empty.title")}
            description={t("empty.description")}
            buttontext={t("empty.button")}
            href="/admin/invoices/create"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.header.number")}</TableHead>
                  <TableHead>{t("table.header.customer")}</TableHead>
                  <TableHead>{t("table.header.amount")}</TableHead>
                  <TableHead>{t("table.header.fees")}</TableHead>
                  <TableHead>{t("table.header.tax")}</TableHead>
                  <TableHead>{t("table.header.delivery")}</TableHead>
                  <TableHead>{t("table.header.status")}</TableHead>
                  <TableHead>{t("table.header.date")}</TableHead>
                  <TableHead>{t("table.header.pdf")}</TableHead>
                  <TableHead>{t("table.header.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell>#{invoice.invoiceNumber}</TableCell>

                    <TableCell>
                      {invoice.user?.firstName} {invoice.user?.lastName}
                    </TableCell>

                    <TableCell>
                      {formatCurrency({
                        amount: invoice.totalAmount,
                        currency: "CAD",
                      })}
                    </TableCell>

                    <TableCell>
                      {formatCurrency({
                        amount: invoice.platformFee ?? 0,
                        currency: "CAD",
                      })}
                    </TableCell>

                    <TableCell>
                      {formatCurrency({
                        amount: invoice.taxAmount ?? 0,
                        currency: "CAD",
                      })}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package size={16} />
                        <span className="text-xs">
                          {invoice.delivery?.trackingNumber}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusChangePopup
                        currentStatus={invoice.status}
                        invoice={invoice}
                        onStatusChange={refetch}
                      />
                    </TableCell>

                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>

                    <TableCell>
                      {invoice?.pdfUrl ? (
                        <Link href={invoice.pdfUrl} target="_blank">
                          <CloudDownload className="text-primary hover:text-primary-hover cursor-pointer" />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Non disponible
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <InvoiceActions
                        status={invoice.status}
                        invoice={invoice}
                        filters={filters}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <CustomPagination
              currentPage={paginationInfo.page}
              totalPages={paginationInfo.pages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </>
  );
}
