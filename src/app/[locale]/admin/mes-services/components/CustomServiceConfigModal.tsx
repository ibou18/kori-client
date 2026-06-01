"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { ServiceGroup } from "./serviceForm";

export interface CustomServiceConfig {
  categoryId: string;
  categoryName: string;
  group: ServiceGroup;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: CustomServiceConfig) => void;
  categories: Category[];
  salonType?: string;
}

export function CustomServiceConfigModal({
  open,
  onClose,
  onConfirm,
  categories,
  salonType,
}: Props) {
  // Les options d'épaisseur ne concernent que les coiffeurs (parité mobile)
  const showThickness = salonType === "HAIRDRESSER";

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [hasThickness, setHasThickness] = useState<boolean | null>(
    showThickness ? null : false,
  );

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedCategory(null);
      setHasThickness(showThickness ? null : false);
    }
  }, [open, showThickness]);

  const confirm = (thickness: boolean) => {
    if (!selectedCategory) return;
    onConfirm({
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      group: thickness ? "WITH_OPTIONS" : "SIMPLE",
    });
  };

  const handleNext = () => {
    if (step === 1 && selectedCategory) {
      if (showThickness) setStep(2);
      else confirm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {step === 1 ? "Créer un service personnalisé" : "Options d'épaisseur"}
          </DialogTitle>
        </DialogHeader>

        {/* Indicateur d'étapes (coiffeur uniquement) */}
        {showThickness && (
          <div className="flex justify-center gap-1.5 py-2">
            <span
              className={`h-1.5 rounded-full transition-all ${
                step >= 1 ? "w-6 bg-[#53745D]" : "w-1.5 bg-slate-300"
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all ${
                step >= 2 ? "w-6 bg-[#53745D]" : "w-1.5 bg-slate-300"
              }`}
            />
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-3 py-2">
            <div>
              <p className="font-medium text-slate-900">Choisir la catégorie *</p>
              <p className="text-sm text-slate-500">
                Sélectionnez la catégorie à laquelle appartient votre service
              </p>
            </div>
            <div className="space-y-2">
              {categories.length === 0 && (
                <p className="text-sm text-slate-400">
                  Aucune catégorie disponible pour ce type de salon.
                </p>
              )}
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    selectedCategory?.id === cat.id
                      ? "border-[#53745D] bg-[#F0F4F1]"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={
                      selectedCategory?.id === cat.id
                        ? "font-semibold text-[#53745D]"
                        : "text-slate-900"
                    }
                  >
                    {cat.name}
                  </span>
                  {selectedCategory?.id === cat.id && (
                    <Check className="h-5 w-5 text-[#53745D]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div>
              <p className="font-medium text-slate-900">Options d'épaisseur *</p>
              <p className="text-sm text-slate-500">
                Votre service aura-t-il des options d'épaisseur (Petit, Moyen,
                Gros) ?
              </p>
            </div>
            <div className="space-y-2">
              {[
                {
                  value: true,
                  title: "Avec options d'épaisseur",
                  desc: "Le service aura 3 options de prix (Petit, Moyen, Gros)",
                },
                {
                  value: false,
                  title: "Sans options d'épaisseur",
                  desc: "Le service aura un seul prix",
                },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setHasThickness(opt.value)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    hasThickness === opt.value
                      ? "border-[#53745D] bg-[#F0F4F1]"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      hasThickness === opt.value
                        ? "border-[#53745D]"
                        : "border-slate-300"
                    }`}
                  >
                    {hasThickness === opt.value && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#53745D]" />
                    )}
                  </span>
                  <span>
                    <span className="block font-medium text-slate-900">
                      {opt.title}
                    </span>
                    <span className="block text-sm text-slate-500">
                      {opt.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          {step === 1 ? (
            <Button
              onClick={handleNext}
              disabled={!selectedCategory}
              className="bg-[#53745D] hover:bg-[#3a5a47] text-white"
            >
              {showThickness ? "Suivant" : "Continuer"}
            </Button>
          ) : (
            <Button
              onClick={() => confirm(hasThickness === true)}
              disabled={hasThickness === null}
              className="bg-[#53745D] hover:bg-[#3a5a47] text-white"
            >
              Continuer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
