import { useState, useMemo, useEffect } from "react";

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentItems: T[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function usePagination<T>({
  data,
  itemsPerPage,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  // Si la page courante dépasse le nombre de pages disponibles, revenir à la page 1
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data?.slice(indexOfFirstItem, indexOfLastItem) || [];
  }, [currentPage, data, itemsPerPage]);

  return {
    currentItems,
    currentPage,
    totalPages,
    setCurrentPage,
  };
}
