"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { CustomPagination } from "@/app/components/CustomPagination";
import { SearchInput } from "@/app/components/SearchInput";
import { usePagination } from "@/app/hooks/usePagination";
import { useSearch } from "@/app/hooks/useSearch";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminListLayoutProps<T> {
  title: string;
  data: T[] | undefined;
  isLoading?: boolean;
  columns: Column<T>[];
  searchKeys: (keyof T | string)[];
  onAdd?: () => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  addButtonLabel?: string;
  emptyMessage?: string;
  itemsPerPage?: number;
  filterComponent?: React.ReactNode;
}

export function AdminListLayout<T extends { id: string }>({
  title,
  data = [],
  isLoading = false,
  columns,
  searchKeys,
  onAdd,
  onView,
  onEdit,
  onDelete,
  addButtonLabel = "Ajouter",
  emptyMessage = "Aucun élément trouvé",
  itemsPerPage = 10,
  filterComponent,
}: AdminListLayoutProps<T>) {
  const [deleteItem, setDeleteItem] = useState<T | null>(null);

  // Recherche
  const { searchQuery, setSearchQuery, filteredData } = useSearch({
    data,
    searchKeys: searchKeys as string[],
  });

  // Pagination
  const { currentItems, currentPage, totalPages, setCurrentPage } =
    usePagination({
      data: filteredData,
      itemsPerPage,
    });

  const handleDelete = (item: T) => {
    setDeleteItem(item);
  };

  const confirmDelete = () => {
    if (deleteItem && onDelete) {
      onDelete(deleteItem);
      setDeleteItem(null);
    }
  };

  return (
    <PageWrapper
      title={title}
      buttonTitle={onAdd ? addButtonLabel : undefined}
      handleClick={onAdd}
      icon={<Plus className="h-4 w-4" />}
    >
      {/* Filtres et Recherche */}
      <div className="mb-6 space-y-4">
        {filterComponent && (
          <div className="flex flex-wrap gap-4">{filterComponent}</div>
        )}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Rechercher dans ${title.toLowerCase()}...`}
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredData.length} {title.toLowerCase()}
          </div>
        </div>
      </div>

      {/* Tableau Desktop / Cartes Mobile */}
      <div className="rounded-lg border bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-24" />
              </div>
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* Vue Desktop - Tableau */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.key} className={column.className}>
                        {column.header}
                      </TableHead>
                    ))}
                    {(onView || onEdit || onDelete) && (
                      <TableHead className="text-right w-[120px]">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item) => (
                    <TableRow key={item.id}>
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          className={column.className}
                        >
                          {column.render(item)}
                        </TableCell>
                      ))}
                      {(onView || onEdit || onDelete) && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onView && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(item)}
                                className="h-8 w-8 p-0 hover:bg-[#F0F4F1] hover:text-[#53745D]"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(item)}
                                className="h-8 w-8 p-0 hover:bg-[#F0F4F1] hover:text-[#53745D]"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(item)}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Confirmer la suppression
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer cet
                                      élément ? Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={confirmDelete}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Vue Mobile - Cartes */}
            <div className="md:hidden space-y-4 p-4">
              {currentItems.map((item) => (
                <Card key={item.id} className="border border-gray-200">
                  <CardContent className="p-4 space-y-4">
                    {/* Contenu des colonnes */}
                    <div className="space-y-3">
                      {columns.map((column) => (
                        <div
                          key={column.key}
                          className="flex flex-col space-y-1 border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                        >
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {column.header}
                          </div>
                          <div className="text-sm text-gray-900">
                            {column.render(item)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {(onView || onEdit || onDelete) && (
                      <div className="flex items-center justify-end gap-2 pt-3 border-t">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(item)}
                            className="h-9 px-3 hover:bg-[#F0F4F1] hover:text-[#53745D]"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="h-9 px-3 hover:bg-[#F0F4F1] hover:text-[#53745D]"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                        )}
                        {onDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item)}
                                className="h-9 px-3 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmer la suppression
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cet élément
                                  ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmDelete}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
