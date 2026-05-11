import { useState, useMemo, useEffect, useRef } from "react";

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

  // Quand initialQuery arrive avec une valeur non-vide (ex : restore depuis URL après montage),
  // on synchronise une seule fois.
  const syncedRef = useRef(false);
  useEffect(() => {
    if (!syncedRef.current && initialQuery) {
      setSearchQuery(initialQuery);
      syncedRef.current = true;
    }
  }, [initialQuery]);

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
