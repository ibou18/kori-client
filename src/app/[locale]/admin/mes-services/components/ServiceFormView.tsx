"use client";

import {
  useCreateSalonService,
  useUpdateSalonService,
  useUploadServicePhoto,
} from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ImagePlus,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CustomServiceConfig,
  CustomServiceConfigModal,
} from "./CustomServiceConfigModal";
import { ServiceSelectionModal } from "./ServiceSelectionModal";
import {
  DefaultService,
  DESCRIPTION_SALON_TYPES,
  EMPTY_FORM,
  ExistingPhoto,
  ServiceGroup,
  THICKNESS_LABELS,
  buildCreatePayload,
  buildUpdatePayload,
  formatHours,
  useServiceForm,
} from "./serviceForm";

interface Category {
  id: string;
  name: string;
}

export interface EditableService {
  id: string;
  name: string;
  description?: string;
  particularities?: string;
  duration?: number;
  categoryId?: string;
  category?: { id: string; name: string };
  group?: ServiceGroup;
  requiresExtensions?: boolean;
  availableLocations?: ("SALON_ONLY" | "HOME_ONLY")[];
  travelFees?: number | null;
  options?: {
    id?: string;
    name?: string;
    price: number;
    discountPrice?: number | null;
    thicknessOption?: "SMALL" | "MEDIUM" | "LARGE";
  }[];
  photos?: ExistingPhoto[];
}

interface Props {
  salonId: string;
  salonType: string;
  categories: Category[];
  defaultServices: DefaultService[];
  editingService: EditableService | null;
  /** Appelé après enregistrement ou annulation (navigation retour). */
  onDone: () => void;
}

const LOCATION_OPTIONS: { value: "SALON_ONLY" | "HOME_ONLY"; label: string }[] = [
  { value: "SALON_ONLY", label: "Au salon" },
  { value: "HOME_ONLY", label: "À domicile" },
];

export function ServiceFormView({
  salonId,
  salonType,
  categories,
  defaultServices,
  editingService,
  onDone,
}: Props) {
  const isEdit = !!editingService;

  const {
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
  } = useServiceForm();

  // Vue interne : sélection d'un service par défaut, ou formulaire détaillé
  const [view, setView] = useState<"select" | "form">(
    isEdit ? "form" : "select",
  );
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Photo
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { mutate: createService, isPending: creating } = useCreateSalonService();
  const { mutate: updateService, isPending: updating } = useUpdateSalonService();
  const { mutate: uploadPhoto, isPending: uploading } = useUploadServicePhoto();

  const showDescription = DESCRIPTION_SALON_TYPES.includes(salonType);
  const showExtension = salonType === "HAIRDRESSER";
  const group: ServiceGroup =
    formData.selectedDefaultService?.group || formData.group || "SIMPLE";
  const isCustom = !formData.selectedDefaultService && !!formData.group;

  // Initialisation (création : formulaire vierge ; édition : pré-remplissage)
  useEffect(() => {
    setImageFile(null);

    if (editingService) {
      const opts = editingService.options?.length
        ? editingService.options.map((o, i) => ({
            id: o.id ?? (i + 1).toString(),
            name: o.name ?? "",
            regularPrice: o.price != null ? o.price.toString() : "",
            promoPrice:
              o.discountPrice != null ? o.discountPrice.toString() : "",
            thickness: o.thicknessOption,
          }))
        : [{ id: "1", name: "", regularPrice: "", promoPrice: "" }];

      const matchingDefault = defaultServices.find(
        (d) => d.name === editingService.name,
      );

      setFormData({
        ...EMPTY_FORM,
        selectedDefaultService: matchingDefault ?? null,
        name: editingService.name,
        description: editingService.description ?? "",
        specifics: editingService.particularities ?? "",
        duration: editingService.duration
          ? (editingService.duration / 60).toString()
          : "1",
        extension: editingService.requiresExtensions ? "Incluse" : "Non incluse",
        availableLocations: editingService.availableLocations?.length
          ? editingService.availableLocations
          : ["SALON_ONLY"],
        travelFees:
          editingService.travelFees != null
            ? editingService.travelFees.toString()
            : "10",
        options: opts,
        group: matchingDefault ? undefined : editingService.group ?? "SIMPLE",
        categoryId: editingService.categoryId,
      });

      const mainPhoto =
        editingService.photos?.find((p) => p.isMain) ??
        editingService.photos?.[0];
      setImagePreview(mainPhoto?.url ?? null);
      setView("form");
    } else {
      resetForm();
      setImagePreview(null);
      setView("select");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingService?.id]);

  const onSelectDefault = (service: DefaultService) => {
    handleSelectDefaultService(service);
    setShowSelectionModal(false);
    setView("form");
  };

  const onConfirmCustom = (config: CustomServiceConfig) => {
    const options =
      config.group === "WITH_OPTIONS"
        ? (["SMALL", "MEDIUM", "LARGE"] as const).map((thickness, i) => ({
            id: (i + 1).toString(),
            name: "",
            regularPrice: "",
            promoPrice: "",
            thickness,
          }))
        : [{ id: "1", name: "", regularPrice: "", promoPrice: "" }];

    updateFormData({
      selectedDefaultService: null,
      name: "",
      options,
      group: config.group,
      categoryId: config.categoryId,
      extension: "Non incluse",
      duration: "1",
      availableLocations: ["SALON_ONLY"],
      travelFees: "10",
      specifics: "",
      description: "",
    });
    setShowConfigModal(false);
    setView("form");
  };

  const finalCategoryId = useMemo(() => {
    if (formData.selectedDefaultService) {
      const s = formData.selectedDefaultService;
      return (
        s.categoryId ??
        (typeof s.category === "object" ? s.category?.id : undefined) ??
        formData.categoryId ??
        editingService?.categoryId ??
        ""
      );
    }
    return formData.categoryId ?? editingService?.categoryId ?? "";
  }, [formData, editingService]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleLocation = (loc: "SALON_ONLY" | "HOME_ONLY") => {
    const current = formData.availableLocations;
    const next = current.includes(loc)
      ? current.filter((l) => l !== loc)
      : [...current, loc];
    updateFormData({ availableLocations: next.length ? next : current });
  };

  const adjustDuration = (delta: number) => {
    const current = parseFloat(formData.duration || "0") || 0;
    const next = Math.max(0, Math.round((current + delta) * 2) / 2);
    updateFormData({ duration: next.toString() });
  };

  const handleSubmit = () => {
    const { isValid, errors } = validateForm();
    if (!isValid) {
      toast.error(errors[0] ?? "Formulaire invalide");
      return;
    }
    if (!finalCategoryId) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }

    const afterSave = (serviceId?: string) => {
      if (imageFile && serviceId) {
        uploadPhoto({ serviceId, file: imageFile });
      }
      onDone();
    };

    if (isEdit && editingService) {
      updateService(
        {
          salonId,
          serviceId: editingService.id,
          data: buildUpdatePayload(formData, finalCategoryId),
        },
        { onSuccess: () => afterSave(editingService.id) },
      );
    } else {
      createService(
        buildCreatePayload(salonId, formData, finalCategoryId, salonType),
        {
          onSuccess: (res: any) => {
            const newId = res?.data?.id ?? res?.id;
            afterSave(newId);
          },
        },
      );
    }
  };

  const durationHours = parseFloat(formData.duration || "0") || 0;
  const saving = creating || updating || uploading;

  // ÉTAPE SÉLECTION (création uniquement)
  if (view === "select" && !isEdit) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-sm text-slate-500">
          Choisissez un service prédéfini (pré-rempli) ou créez le vôtre.
        </p>
        <button
          onClick={() => setShowSelectionModal(true)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-[#53745D]/50 hover:bg-[#F0F4F1]"
        >
          <div>
            <p className="font-semibold text-slate-900">
              Choisir un service par défaut
            </p>
            <p className="text-sm text-slate-500">
              Parcourez le catalogue par catégorie
            </p>
          </div>
          <Plus className="h-5 w-5 text-[#53745D]" />
        </button>
        <button
          onClick={() => setShowConfigModal(true)}
          className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-300 p-4 text-left transition-colors hover:border-[#53745D]/50 hover:bg-[#F0F4F1]"
        >
          <div>
            <p className="font-semibold text-slate-900">
              Créer un service personnalisé
            </p>
            <p className="text-sm text-slate-500">
              Définissez votre propre service
            </p>
          </div>
          <Plus className="h-5 w-5 text-[#53745D]" />
        </button>

        <div className="pt-2">
          <Button variant="outline" onClick={onDone}>
            Annuler
          </Button>
        </div>

        <ServiceSelectionModal
          open={showSelectionModal}
          onClose={() => setShowSelectionModal(false)}
          services={defaultServices}
          onSelect={onSelectDefault}
        />
        <CustomServiceConfigModal
          open={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onConfirm={onConfirmCustom}
          categories={categories}
          salonType={salonType}
        />
      </div>
    );
  }

  // FORMULAIRE
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Bandeau : service par défaut / personnalisé (création) */}
      {!isEdit && (
        <div className="flex items-center justify-between rounded-lg bg-[#F0F4F1] px-3 py-2 text-sm">
          <span className="text-[#53745D]">
            {formData.selectedDefaultService
              ? `Service par défaut : ${formData.selectedDefaultService.name}`
              : "Service personnalisé"}
          </span>
          <button
            onClick={() => setView("select")}
            className="flex items-center gap-1 text-xs font-medium text-[#53745D] hover:underline"
          >
            <RefreshCw className="h-3 w-3" /> Changer
          </button>
        </div>
      )}

      {/* Nom */}
      <div>
        <Label htmlFor="svc-name">Nom du service *</Label>
        <Input
          id="svc-name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Ex: Coupe femme"
          className="mt-1"
          disabled={!!formData.selectedDefaultService && !isEdit}
        />
      </div>

      {/* Description (selon type de salon) */}
      {showDescription && (
        <div>
          <Label htmlFor="svc-desc">Description</Label>
          <Textarea
            id="svc-desc"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Décrivez le service…"
            className="mt-1 resize-none"
            rows={2}
          />
        </div>
      )}

      {/* Prix / Options */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>{group === "WITH_OPTIONS" ? "Options & prix" : "Prix"}</Label>
          {group === "WITH_OPTIONS" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-[#53745D]"
              onClick={handleAddOption}
            >
              <Plus className="h-3.5 w-3.5" /> Ajouter
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {formData.options.map((opt) => (
            <div
              key={opt.id}
              className="relative rounded-lg border border-slate-200 bg-slate-50/60 p-3 pt-4"
            >
              {formData.options.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-red-400 hover:bg-red-50"
                  onClick={() => handleRemoveOption(opt.id)}
                  aria-label="Supprimer cette option"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}

              {opt.thickness && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#53745D]">
                  {THICKNESS_LABELS[opt.thickness]}
                </p>
              )}

              {group === "WITH_OPTIONS" && (
                <div className="mb-3 space-y-1">
                  <Label
                    htmlFor={`opt-name-${opt.id}`}
                    className="text-xs font-medium text-slate-700"
                  >
                    Nom de l&apos;option
                  </Label>
                  <Input
                    id={`opt-name-${opt.id}`}
                    placeholder="Ex. Taille moyenne"
                    value={opt.name}
                    onChange={(e) =>
                      handleUpdateOption(opt.id, "name", e.target.value)
                    }
                    className="bg-white text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label
                    htmlFor={`opt-base-${opt.id}`}
                    className="text-xs font-medium text-slate-700"
                  >
                    Prix de base <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id={`opt-base-${opt.id}`}
                      type="number"
                      min={0}
                      step={1}
                      inputMode="decimal"
                      placeholder="0"
                      value={opt.regularPrice}
                      onChange={(e) =>
                        handleUpdateOption(
                          opt.id,
                          "regularPrice",
                          e.target.value,
                        )
                      }
                      className="bg-white pr-8 text-sm font-medium"
                    />
                    <span
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"
                      aria-hidden
                    >
                      $
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug text-slate-500">
                    Tarif habituel affiché aux clientes
                  </p>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor={`opt-promo-${opt.id}`}
                    className="text-xs font-medium text-slate-700"
                  >
                    Prix promo{" "}
                    <span className="font-normal text-slate-400">
                      (optionnel)
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      id={`opt-promo-${opt.id}`}
                      type="number"
                      min={0}
                      step={1}
                      inputMode="decimal"
                      placeholder="—"
                      value={opt.promoPrice}
                      onChange={(e) =>
                        handleUpdateOption(opt.id, "promoPrice", e.target.value)
                      }
                      className="border-dashed border-[#53745D]/30 bg-white pr-8 text-sm text-[#53745D]"
                    />
                    <span
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#53745D]/60"
                      aria-hidden
                    >
                      $
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug text-slate-500">
                    Prix réduit ; laissez vide si pas de promotion
                  </p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500">
            Montants en dollars canadiens. Le prix promo doit être inférieur ou
            égal au prix de base.
          </p>
        </div>
      </div>

      {/* Mèche / Rallonge (coiffeur) */}
      {showExtension && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <div>
            <p className="text-sm font-medium">Mèche / rallonge incluse</p>
            <p className="text-xs text-slate-500">
              Le service inclut-il les rallonges ?
            </p>
          </div>
          <Switch
            checked={formData.extension === "Incluse"}
            onChange={(v: boolean) =>
              updateFormData({ extension: v ? "Incluse" : "Non incluse" })
            }
          />
        </div>
      )}

      {/* Durée */}
      <div>
        <Label>Durée</Label>
        <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 p-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => adjustDuration(-0.5)}
            disabled={durationHours <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">
              {formatHours(durationHours)}
            </p>
            <p className="text-xs text-slate-500">
              {durationHours.toFixed(1)} heure{durationHours !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => adjustDuration(0.5)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lieu */}
      <div>
        <Label>Lieu</Label>
        <div className="mt-1 flex gap-2">
          {LOCATION_OPTIONS.map((loc) => {
            const active = formData.availableLocations.includes(loc.value);
            return (
              <button
                key={loc.value}
                type="button"
                onClick={() => toggleLocation(loc.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-[#53745D] bg-[#F0F4F1] text-[#53745D]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {loc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Frais de déplacement (si domicile) */}
      {formData.availableLocations.includes("HOME_ONLY") && (
        <div>
          <Label htmlFor="svc-travel">Frais de déplacement ($) *</Label>
          <Input
            id="svc-travel"
            type="number"
            min={0}
            step={1}
            value={formData.travelFees}
            onChange={(e) => updateFormData({ travelFees: e.target.value })}
            className="mt-1"
          />
        </div>
      )}

      {/* Particularités */}
      <div>
        <Label htmlFor="svc-part">Particularités</Label>
        <Input
          id="svc-part"
          value={formData.specifics}
          onChange={(e) => updateFormData({ specifics: e.target.value })}
          placeholder="Ex: Inclut shampooing et coiffage"
          className="mt-1"
        />
      </div>

      {/* Photo */}
      <div>
        <Label>Photo du service</Label>
        <div className="mt-1">
          {imagePreview ? (
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Aperçu"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
              <label
                htmlFor="svc-image"
                className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-xs text-white transition-colors hover:bg-black/70"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Changer
                <input
                  id="svc-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          ) : (
            <label
              htmlFor="svc-image"
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-8 text-slate-400 transition-colors hover:border-[#53745D]/50 hover:text-[#53745D]"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm font-medium">Ajouter une photo</span>
              <span className="text-xs text-slate-400">
                JPG, PNG, WebP — max 5 Mo
              </span>
              <input
                id="svc-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="outline" onClick={onDone} disabled={saving}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid() || saving}
          className="bg-[#53745D] hover:bg-[#3a5a47] text-white"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Enregistrer" : "Créer"}
        </Button>
      </div>

      {/* Modals de sélection / config */}
      <ServiceSelectionModal
        open={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        services={defaultServices}
        onSelect={onSelectDefault}
      />
      <CustomServiceConfigModal
        open={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfirm={onConfirmCustom}
        categories={categories}
        salonType={salonType}
      />
    </div>
  );
}
