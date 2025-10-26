import { useState, useMemo } from "react";

interface UseSearchProps<T> {
  data: T[];
  searchKeys: string[];
  initialQuery?: string;
}

export function useSearch<T>({
  data,
  searchKeys,
  initialQuery = "",
}: UseSearchProps<T>) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data?.filter((item: any) => {
      return searchKeys.some((key) => {
        // Gestion des propriétés imbriquées (ex: "client.name")
        const value = key.split(".").reduce((obj, key) => obj?.[key], item);
        return (
          value &&
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    });
  }, [data, searchQuery, searchKeys]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
  };
}
