"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { CustomPagination } from "@/app/components/CustomPagination";
import { useGetAdminShortLinks } from "@/app/data/hooks";
import type { AdminShortLinkRow } from "@/app/data/services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADMIN } from "@/shared/constantes";
import dayjs from "dayjs";
import { Copy, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

function targetBadge(type: AdminShortLinkRow["targetType"]) {
  switch (type) {
    case "salon":
      return (
        <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
          Salon
        </Badge>
      );
    case "service":
      return (
        <Badge className="bg-[#D6E3D8] text-[#3a5a47] hover:bg-[#D6E3D8]">
          Service
        </Badge>
      );
    default:
      return <Badge variant="secondary">Autre</Badge>;
  }
}

export default function ShortLinksPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<
    "all" | "salon" | "service" | "other"
  >("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, debouncedSearch]);

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const queryParams = useMemo(
    () => ({
      limit: ITEMS_PER_PAGE,
      offset,
      type: typeFilter,
      search: debouncedSearch || undefined,
    }),
    [offset, typeFilter, debouncedSearch],
  );

  const { data, isLoading, isFetching } = useGetAdminShortLinks({
    ...queryParams,
    enabled: role === ADMIN,
  });

  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const copyShortUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien court copié dans le presse-papiers");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page.
      </p>
    );
  }

  if (role !== ADMIN) {
    return (
      <PageWrapper title="Liens courts">
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
          Cette section est réservée aux administrateurs Korí.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Liens courts">
      <p className="text-sm text-gray-600 mb-6 max-w-3xl">
        Liens de partage salons et services (raccourcis), avec le nombre de
        clics enregistré à chaque redirection.
      </p>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:flex-wrap">
        <div className="w-full md:w-56 space-y-2">
          <Label>Type de cible</Label>
          <Select
            value={typeFilter}
            onValueChange={(v) =>
              setTypeFilter(v as "all" | "salon" | "service" | "other")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="salon">Page salon</SelectItem>
              <SelectItem value="service">Page service</SelectItem>
              <SelectItem value="other">Autres URL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px] max-w-md space-y-2">
          <Label htmlFor="shortlink-search">Recherche</Label>
          <Input
            id="shortlink-search"
            placeholder="Code ou URL longue…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-600 pb-2">
          {total} lien{total !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun lien court ne correspond à ces critères.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[160px]">Salon</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Lien court</TableHead>
                    <TableHead className="min-w-[200px]">URL longue</TableHead>
                    <TableHead className="text-right w-[100px]">
                      Clics
                    </TableHead>
                    <TableHead className="w-[120px]">Créé le</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row: AdminShortLinkRow) => (
                    <TableRow key={row.id}>
                      <TableCell>{targetBadge(row.targetType)}</TableCell>
                      <TableCell>
                        {row.salonName ? (
                          <span className="font-medium text-gray-900">
                            <a
                              href={row.longUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {row.salonName}
                            </a>
                          </span>
                        ) : row.salonId ? (
                          <span
                            className="text-sm text-amber-700"
                            title={`Salon introuvable (id : ${row.salonId})`}
                          >
                            Salon supprimé ou inconnu
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {row.code}
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <span
                          className="block truncate text-sm text-[#53745D]"
                          title={row.shortUrl}
                        >
                          {row.shortUrl}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span
                          className="block truncate text-sm text-gray-600"
                          title={row.longUrl}
                        >
                          {row.longUrl}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {row.clickCount}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                        {dayjs(row.createdAt).format("DD MMM YYYY")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Copier le lien court"
                            onClick={() => copyShortUrl(row.shortUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                            title="Ouvrir l’URL longue"
                          >
                            <a
                              href={row.longUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t flex justify-center">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {isFetching && !isLoading && (
        <p className="text-xs text-gray-400 mt-2 text-center">Mise à jour…</p>
      )}
    </PageWrapper>
  );
}
