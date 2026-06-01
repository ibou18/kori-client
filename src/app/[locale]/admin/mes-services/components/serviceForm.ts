/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

// ============================================================================
// Types — adaptés du flux mobile (kori-mobile/app/services)
// ============================================================================

export type ServiceLocation = "HOME_ONLY" | "SALON_ONLY";
export type Thickness = "SMALL" | "MEDIUM" | "LARGE";
export type ServiceGroup = "WITH_OPTIONS" | "SIMPLE";

export interface FormOption {
  id: string;
  name: string;
  regularPrice: string;
  promoPrice: string;
  thickness?: Thickness;
}

export interface ExistingPhoto {
  id: string;
  url: string;
  isMain?: boolean;
}

export interface DefaultServiceOption {
  id?: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  thicknessOption?: Thickness;
}

export interface DefaultService {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutes
  group: ServiceGroup;
  requiresExtensions?: boolean;
  availableLocations?: ServiceLocation[];
  categoryId?: string;
  category?: { id: string; name: string } | string;
  defaultOptions?: DefaultServiceOption[];
}

export interface ServiceFormData {
  selectedDefaultService: DefaultService | null;
  name: string;
  options: FormOption[];
  extension: string; // "Incluse" | "Non incluse"
  duration: string; // en heures (ex: "1.5")
  availableLocations: ServiceLocation[];
  travelFees: string;
  specifics: string;
  description: string;
  group?: ServiceGroup;
  categoryId?: string; // catégorie pour un service personnalisé
}

export const THICKNESS_LABELS: Record<Thickness, string> = {
  SMALL: "Petit",
  MEDIUM: "Moyen",
  LARGE: "Gros",
};

export const EMPTY_FORM: ServiceFormData = {
  selectedDefaultService: null,
  name: "",
  options: [],
  extension: "Non incluse",
  duration: "1",
  availableLocations: ["SALON_ONLY"],
  travelFees: "10",
  specifics: "",
  description: "",
  group: undefined,
  categoryId: undefined,
};

// Types de salon pour lesquels on saisit une description libre (parité mobile)
export const DESCRIPTION_SALON_TYPES = [
  "NAIL_SALON",
  "BODY_CARE",
  "MAQUILLAGE",
  "CILS",
];

// ============================================================================
// Hook de formulaire — porté de useServiceForm (mobile)
// ============================================================================

export const useServiceForm = (initialData?: Partial<ServiceFormData>) => {
  const [formData, setFormData] = useState<ServiceFormData>(() => ({
    ...EMPTY_FORM,
    ...initialData,
  }));

  const resetForm = (data?: Partial<ServiceFormData>) =>
    setFormData({ ...EMPTY_FORM, ...data });

  const updateFormData = (updates: Partial<ServiceFormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  // Sélection d'un service par défaut → pré-remplissage du formulaire
  const handleSelectDefaultService = (service: DefaultService) => {
    const group = service.group || "SIMPLE";
    const options: FormOption[] = (service.defaultOptions ?? []).map(
      (option, index) => ({
        id: (index + 1).toString(),
        name:
          group === "WITH_OPTIONS"
            ? option.name?.split(" - ")[1] || option.name || ""
            : option.name || "",
        regularPrice: option.price != null ? option.price.toString() : "",
        promoPrice:
          option.discountPrice != null
            ? option.discountPrice.toString()
            : option.price != null
              ? (option.price * 0.9).toFixed(0)
              : "",
        thickness:
          group === "WITH_OPTIONS" ? option.thicknessOption : undefined,
      }),
    );

    const durationHours = service.duration
      ? (Math.round((service.duration / 60) * 10) / 10).toString()
      : "1";

    setFormData((prev) => ({
      ...prev,
      selectedDefaultService: service,
      name: service.name,
      description: service.description ?? "",
      options:
        options.length > 0
          ? options
          : [{ id: "1", name: "", regularPrice: "", promoPrice: "" }],
      duration: durationHours,
      extension: service.requiresExtensions ? "Incluse" : "Non incluse",
      // Création : au salon par défaut (le pro peut activer « À domicile » ensuite)
      availableLocations: ["SALON_ONLY"],
      group: undefined, // le group provient désormais du service par défaut
      categoryId:
        service.categoryId ??
        (typeof service.category === "object"
          ? service.category?.id
          : undefined),
    }));
  };

  const handleAddOption = () => {
    const group = formData.selectedDefaultService?.group || formData.group || "SIMPLE";

    if (group === "WITH_OPTIONS") {
      const existing = formData.options.map((o) => o.thickness);
      const all: Thickness[] = ["SMALL", "MEDIUM", "LARGE"];
      const missing = all.filter((t) => !existing.includes(t));
      const newOptions: FormOption[] = missing.map((thickness, i) => ({
        id: (Date.now() + i).toString(),
        name: "",
        regularPrice: "",
        promoPrice: "",
        thickness,
      }));
      setFormData((f) => ({ ...f, options: [...f.options, ...newOptions] }));
    } else {
      setFormData((f) => ({
        ...f,
        options: [
          ...f.options,
          { id: Date.now().toString(), name: "", regularPrice: "", promoPrice: "" },
        ],
      }));
    }
  };

  const handleRemoveOption = (optionId: string) => {
    const group = formData.selectedDefaultService?.group || formData.group || "SIMPLE";
    if (group === "WITH_OPTIONS" && formData.options.length > 1) {
      setFormData((f) => ({
        ...f,
        options: f.options.filter((o) => o.id !== optionId),
      }));
    } else if (group === "SIMPLE" && formData.options.length > 1) {
      setFormData((f) => ({
        ...f,
        options: f.options.filter((o) => o.id !== optionId),
      }));
    }
  };

  const handleUpdateOption = (
    optionId: string,
    field: keyof FormOption,
    value: string,
  ) =>
    setFormData((f) => ({
      ...f,
      options: f.options.map((o) =>
        o.id === optionId ? { ...o, [field]: value } : o,
      ),
    }));

  // Validation temps réel (sans messages)
  const isFormValid = (): boolean => {
    if (!formData.name.trim()) return false;
    if (!formData.selectedDefaultService && !formData.group) return false;
    if (formData.options.length === 0) return false;

    const allPricesValid = formData.options.every((o) => {
      const price = parseFloat(o.regularPrice || "0");
      return o.regularPrice !== "" && !isNaN(price) && price > 0;
    });

    const duration = parseFloat(formData.duration || "0");
    const durationValid =
      formData.duration !== "" && !isNaN(duration) && duration > 0;

    const isHome = formData.availableLocations?.includes("HOME_ONLY");
    const travelFeesValid = isHome
      ? (() => {
          const t = parseFloat(formData.travelFees || "0");
          return formData.travelFees !== "" && !isNaN(t) && t > 0;
        })()
      : true;

    return allPricesValid && durationValid && travelFeesValid;
  };

  // Validation avec messages d'erreur
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.selectedDefaultService && !formData.group) {
      errors.push(
        "Veuillez sélectionner un service par défaut ou créer un service personnalisé",
      );
    }
    if (!formData.name.trim()) errors.push("Le nom du service est requis");
    if (formData.options.length === 0)
      errors.push("Au moins une option de prix est requise");

    formData.options.forEach((option, index) => {
      const price = parseFloat(option.regularPrice || "0");
      if (option.regularPrice === "" || isNaN(price) || price <= 0) {
        const label = option.thickness
          ? THICKNESS_LABELS[option.thickness]
          : `Option ${index + 1}`;
        errors.push(
          `Le prix régulier de "${label}" est requis et doit être supérieur à 0`,
        );
      }
    });

    const duration = parseFloat(formData.duration || "0");
    if (formData.duration === "" || isNaN(duration) || duration <= 0) {
      errors.push("La durée est requise et doit être supérieure à 0");
    }

    if (formData.availableLocations?.includes("HOME_ONLY")) {
      const t = parseFloat(formData.travelFees || "0");
      if (formData.travelFees === "" || isNaN(t) || t <= 0) {
        errors.push(
          "Les frais de déplacement sont requis pour un service à domicile",
        );
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  return {
    formData,
    setFormData,
    resetForm,
    updateFormData,
    handleSelectDefaultService,
    handleAddOption,
    handleRemoveOption,
    handleUpdateOption,
    isFormValid,
    validateForm,
  };
};

// ============================================================================
// Construction du payload serveur (POST/PATCH /salons/:salonId/services)
// ============================================================================

const buildOptions = (formData: ServiceFormData) =>
  formData.options.map((option) => {
    const regularPrice = parseInt(option.regularPrice, 10);
    const promoValue = option.promoPrice ? parseFloat(option.promoPrice) : null;
    const discountPrice =
      promoValue !== null && !isNaN(promoValue) && promoValue > 0
        ? parseInt(option.promoPrice, 10)
        : regularPrice;

    let optionName = option.name?.trim() || "";
    if (!optionName && option.thickness) {
      optionName = THICKNESS_LABELS[option.thickness];
    } else if (!optionName) {
      optionName = "Standard";
    }

    return {
      name: optionName,
      price: regularPrice,
      discountPrice,
      thicknessOption: option.thickness,
      includesExtensions: formData.extension === "Incluse",
    };
  });

export const buildCreatePayload = (
  salonId: string,
  formData: ServiceFormData,
  categoryId: string,
  salonType: string,
) => {
  const durationMinutes = Math.round(parseFloat(formData.duration || "0") * 60);
  const group =
    formData.selectedDefaultService?.group || formData.group || "SIMPLE";
  const isHome = formData.availableLocations.includes("HOME_ONLY");

  return {
    salonId,
    name: formData.name,
    description:
      formData.description?.trim() ||
      formData.selectedDefaultService?.description ||
      "",
    particularities: formData.specifics?.trim() || undefined,
    categoryId,
    duration: durationMinutes,
    group,
    hasThicknessOptions: group === "WITH_OPTIONS",
    requiresExtensions: formData.extension === "Incluse",
    availableLocations: formData.availableLocations,
    travelFees:
      isHome && formData.travelFees?.trim()
        ? parseFloat(formData.travelFees) || undefined
        : undefined,
    salonType,
    options: buildOptions(formData),
  };
};

export const buildUpdatePayload = (
  formData: ServiceFormData,
  categoryId: string,
) => {
  const durationMinutes = Math.round(parseFloat(formData.duration || "0") * 60);
  const group =
    formData.selectedDefaultService?.group || formData.group || "SIMPLE";
  const isHome = formData.availableLocations.includes("HOME_ONLY");

  return {
    name: formData.name,
    description:
      formData.description?.trim() ||
      formData.selectedDefaultService?.description ||
      "",
    particularities: formData.specifics?.trim() || undefined,
    categoryId,
    duration: durationMinutes,
    group,
    hasThicknessOptions: group === "WITH_OPTIONS",
    requiresExtensions: formData.extension === "Incluse",
    availableLocations: formData.availableLocations,
    travelFees:
      isHome && formData.travelFees?.trim()
        ? parseFloat(formData.travelFees) || undefined
        : undefined,
    options: buildOptions(formData),
  };
};

// Affichage d'une durée en heures → "1h30", "45min", "2h"
export const formatHours = (hours: number): string => {
  if (!hours) return "0h";
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (minutes === 0) return `${whole}h`;
  if (whole === 0) return `${minutes}min`;
  return `${whole}h${String(minutes).padStart(2, "0")}`;
};

// Normaliser le champ `category` (string | objet) en nom lisible
export const getCategoryName = (category: any): string =>
  typeof category === "string" ? category : (category?.name ?? "");

// Libellé FR d'un type de salon (parité mobile getSalonTypeText)
export const SALON_TYPE_LABELS: Record<string, string> = {
  HAIRDRESSER: "Coiffure",
  BARBER: "Barbier",
  NAIL_SALON: "Manucure",
  MAQUILLAGE: "Maquillage",
  CILS: "Cils et sourcils",
  BODY_CARE: "Soins corporels",
};

export const getSalonTypeText = (type: string): string =>
  SALON_TYPE_LABELS[type] ?? type;
