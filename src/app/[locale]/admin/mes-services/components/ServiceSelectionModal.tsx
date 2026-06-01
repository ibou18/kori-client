"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight, Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DefaultService,
  formatHours,
  getCategoryName,
} from "./serviceForm";

interface Props {
  open: boolean;
  onClose: () => void;
  services: DefaultService[];
  onSelect: (service: DefaultService) => void;
}

const GROUP_LABEL: Record<string, string> = {
  WITH_OPTIONS: "Avec options",
  SIMPLE: "Simple",
};

export function ServiceSelectionModal({
  open,
  onClose,
  services,
  onSelect,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const names = Array.from(
      new Set(services.map((s) => getCategoryName(s.category)).filter(Boolean)),
    );
    return ["all", ...names];
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchCat =
        selectedCategory === "all" ||
        getCategoryName(s.category) === selectedCategory;
      const matchSearch =
        !search || s.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, search]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex h-[min(90vh,720px)] max-h-[90vh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-slate-100 px-5 py-4 pr-12">
          <DialogTitle>Choisir un service</DialogTitle>
        </DialogHeader>

        {/* Recherche + filtres catégories (zone fixe, non écrasée par la liste) */}
        <div className="shrink-0 space-y-3 border-b border-slate-100 px-5 pb-4 pt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher un service…"
              className="pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium leading-snug transition-colors ${
                  selectedCategory === cat
                    ? "border-[#53745D] bg-[#F0F4F1] text-[#53745D]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat === "all" ? "Toutes les catégories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Liste services par défaut */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-2">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Aucun service par défaut dans cette catégorie
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((service) => {
                const categoryName = getCategoryName(service.category);
                return (
                  <li key={service.id}>
                    <button
                      onClick={() => onSelect(service)}
                      className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          {categoryName && (
                            <span className="font-medium text-[#53745D]">
                              {categoryName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatHours((service.duration || 0) / 60)}
                          </span>
                          <span>{GROUP_LABEL[service.group] ?? service.group}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
