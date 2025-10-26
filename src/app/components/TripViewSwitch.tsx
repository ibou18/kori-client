"use client";

import { GridIcon, ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripList } from "./TripList";
import { TripListCard } from "./TripListCard";
import { useState, useEffect, useCallback } from "react";

type ViewMode = "list" | "card";

interface TripViewSwitchProps {
  data: any;
  onRefresh?: (newPage?: number, newLimit?: number) => void;
  isLoading?: boolean;
}

// Clé de stockage dans le localStorage
const VIEW_MODE_STORAGE_KEY = "hop-trips-view-mode";

export function TripViewSwitch({
  data,
  onRefresh,
  isLoading = false,
}: TripViewSwitchProps) {
  // Initialiser le mode d'affichage depuis localStorage si disponible
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY) as ViewMode;
      return savedMode === "list" ? "list" : "card";
    }
    return "card"; // Valeur par défaut
  });

  // Définir la limite en fonction du mode d'affichage
  const getLimit = useCallback(
    (mode: ViewMode) => (mode === "card" ? 12 : 10),
    []
  );

  // Sauvegarder le viewMode dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  // Effet séparé qui s'exécute une seule fois au montage pour s'assurer que le localStorage est initialisé
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (!currentMode) {
        // Si aucune valeur n'existe encore, initialiser avec la valeur par défaut
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
      }
    }
  }, []);

  // Gérer le changement de page
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (onRefresh) {
        onRefresh(newPage, getLimit(viewMode));
      }
    },
    [onRefresh, viewMode, getLimit]
  );

  // Gérer le changement de mode d'affichage
  const changeViewMode = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);

      if (onRefresh) {
        // Réinitialiser à la page 1 et mettre à jour la limite
        const newLimit = getLimit(mode);
        onRefresh(1, newLimit);
      }
    },
    [onRefresh, getLimit]
  );

  // Gérer la recherche (propagation au parent)
  const handleSearchChange = useCallback(
    (term: string) => {
      if (onRefresh) {
        // Le parent gère le debounce
        onRefresh(1, getLimit(viewMode));
      }
    },
    [onRefresh, viewMode, getLimit]
  );

  return (
    <div className="space-y-4">
      {/* Sélecteur de vue */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => changeViewMode("list")}
            className="rounded-r-none"
            disabled={isLoading}
          >
            <ListIcon className="h-4 w-4 mr-1" />
            Tableau
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => changeViewMode("card")}
            className="rounded-l-none"
            disabled={isLoading}
          >
            <GridIcon className="h-4 w-4 mr-1" />
            Cartes
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <TripList
          data={data}
          onPageChange={handlePageChange}
          onSearchChange={handleSearchChange}
          isLoading={isLoading}
        />
      ) : (
        <TripListCard
          data={data}
          onPageChange={handlePageChange}
          onSearchChange={handleSearchChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
