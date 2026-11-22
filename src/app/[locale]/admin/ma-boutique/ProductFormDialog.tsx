"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  checkProductPhoto,
  EMPTY_PRODUCT_FORM,
  formToPayload,
  PRODUCT_PHOTO_MAX,
  productToForm,
  type ProductFormValues,
} from "./productForm";
import type { AdminProduct } from "./types";
import { useProductMutations } from "./useShopAdmin";

/** Photo choisie, pas encore envoyée : envoyée avec le produit à l'enregistrement. */
interface PendingPhoto {
  key: string;
  file: File;
  previewUrl: string;
}

const textareaClass =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Création / modification d'un produit, photos comprises, en un seul enregistrement.
 * Les photos choisies sont prévisualisées localement puis envoyées avec le produit :
 * si le produit est refusé, aucune photo n'est envoyée ; si une photo est refusée,
 * le produit est enregistré quand même et la photo est signalée.
 */
export function ProductFormDialog({
  salonId,
  open,
  onOpenChange,
  product,
  services,
}: {
  salonId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = création. Toujours la version fraîche (relue depuis la liste). */
  product: AdminProduct | null;
  services: { id: string; name: string }[];
}) {
  const { create, update, deletePhoto } = useProductMutations(salonId);
  const [form, setForm] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const pendingRef = useRef<PendingPhoto[]>([]);
  pendingRef.current = pending;

  const productId = product?.id ?? null;

  const clearPending = () => {
    pendingRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPending([]);
  };

  // Réinitialise à l'ouverture (et seulement à l'ouverture : pas à chaque relecture de la liste).
  useEffect(() => {
    if (!open) return;
    setForm(product ? productToForm(product) : EMPTY_PRODUCT_FORM);
    setErrors({});
    setPhotoError(null);
    clearPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  // Libère les aperçus locaux au démontage.
  useEffect(() => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)), []);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleService = (id: string) =>
    set(
      "recommendedServiceIds",
      form.recommendedServiceIds.includes(id)
        ? form.recommendedServiceIds.filter((s) => s !== id)
        : [...form.recommendedServiceIds, id],
    );

  const saving = create.isPending || update.isPending;

  const photos = product?.photos ?? [];
  const remainingSlots = PRODUCT_PHOTO_MAX - photos.length - pending.length;

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const accepted: PendingPhoto[] = [];
    const refused: string[] = [];
    for (const file of Array.from(fileList)) {
      if (accepted.length >= remainingSlots) {
        refused.push(`${PRODUCT_PHOTO_MAX} photos maximum par produit.`);
        break;
      }
      const problem = checkProductPhoto(file);
      if (problem) {
        refused.push(problem);
        continue;
      }
      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (accepted.length) setPending((current) => [...current, ...accepted]);
    setPhotoError(refused.length ? refused.join(" ") : null);
  };

  const removePending = (key: string) =>
    setPending((current) => {
      const target = current.find((p) => p.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((p) => p.key !== key);
    });

  const close = () => {
    clearPending();
    onOpenChange(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = formToPayload(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    const files = pending.map((p) => p.file);
    if (productId) {
      update.mutate({ id: productId, data: result.payload, files }, { onSuccess: close });
    } else {
      create.mutate({ data: result.payload, files }, { onSuccess: close });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{productId ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          <DialogDescription>
            Prix toutes taxes comprises : c&apos;est le montant payé par le client. korí retient sa commission sur
            chaque vente.
          </DialogDescription>
        </DialogHeader>

        <form id="product-form" onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Nom du produit" htmlFor="p-name" error={errors.name}>
            <Input
              id="p-name"
              value={form.name}
              maxLength={120}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Huile fortifiante cuir chevelu"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prix (TTC, $)" htmlFor="p-price" error={errors.price}>
              <Input
                id="p-price"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="24,00"
              />
            </Field>
            <Field label="Format" htmlFor="p-size" hint="Ex. 30 ml, 250 g">
              <Input id="p-size" value={form.size} maxLength={80} onChange={(e) => set("size", e.target.value)} />
            </Field>
          </div>

          <Field label="Catégorie" htmlFor="p-category" hint="Ex. Soin du cuir chevelu, Accessoire">
            <Input
              id="p-category"
              value={form.category}
              maxLength={80}
              onChange={(e) => set("category", e.target.value)}
            />
          </Field>

          <Field label="Description" htmlFor="p-description">
            <textarea
              id="p-description"
              rows={3}
              maxLength={2000}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={textareaClass}
            />
          </Field>

          <Field label="Votre conseil" htmlFor="p-tip" hint="Affiché sur la fiche produit : « Le conseil de … »">
            <textarea
              id="p-tip"
              rows={2}
              maxLength={2000}
              value={form.tip}
              onChange={(e) => set("tip", e.target.value)}
              placeholder="Quelques gouttes sur les raies, deux fois par semaine"
              className={textareaClass}
            />
          </Field>

          <div className="flex flex-col gap-2 rounded-lg border p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.trackStock}
                onChange={(e) => set("trackStock", e.target.checked)}
                className="size-4"
              />
              Suivre le stock
            </label>
            {form.trackStock ? (
              <Field label="Quantité en stock" htmlFor="p-stock" error={errors.stock}>
                <Input
                  id="p-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  className="w-32"
                />
              </Field>
            ) : (
              <p className="text-xs text-muted-foreground">
                Stock non suivi : le produit reste toujours disponible. Activez le suivi pour qu&apos;il passe en
                rupture automatiquement.
              </p>
            )}
          </div>

          {services.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Proposé avec les prestations</legend>
              <p className="text-xs text-muted-foreground">
                Suggéré au client pendant la réservation de ces prestations (« Souvent pris avec … »).
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {services.map((service) => {
                  const checked = form.recommendedServiceIds.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      aria-pressed={checked}
                      onClick={() => toggleService(service.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        checked ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
                      )}
                    >
                      {service.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="size-4"
            />
            En vente sur ma page
          </label>
        </form>

        <div className="flex flex-col gap-2 border-t pt-4">
          <p className="text-sm font-medium">Photos</p>
          <div className="flex flex-wrap gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative size-20 overflow-hidden rounded-lg border bg-muted">
                <Image src={photo.url} alt="" fill sizes="80px" className="object-cover" />
                {photo.isMain && (
                  <span className="absolute left-1 top-1 rounded bg-black/70 p-0.5 text-white" title="Photo principale">
                    <Star className="size-3" />
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Supprimer la photo"
                  disabled={deletePhoto.isPending || saving}
                  onClick={() => productId && deletePhoto.mutate({ id: productId, photoId: photo.id })}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            {pending.map((p, i) => (
              <div key={p.key} className="relative size-20 overflow-hidden rounded-lg border border-dashed bg-muted">
                {/* Aperçu local (blob:) : next/image ne l'optimise pas. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.previewUrl} alt="" className="size-full object-cover" />
                {photos.length === 0 && i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-black/70 p-0.5 text-white" title="Photo principale">
                    <Star className="size-3" />
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[10px] font-medium text-white">
                  {saving ? "Envoi…" : "À enregistrer"}
                </span>
                {!saving && (
                  <button
                    type="button"
                    aria-label="Retirer cette photo"
                    onClick={() => removePending(p.key)}
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
            {remainingSlots > 0 && (
              <label
                aria-label="Ajouter des photos"
                aria-disabled={saving}
                className={cn(
                  "grid size-20 cursor-pointer place-items-center rounded-lg border border-dashed text-muted-foreground hover:bg-accent focus-within:ring-2 focus-within:ring-ring",
                  saving && "pointer-events-none opacity-60",
                )}
              >
                <ImagePlus className="size-5" />
                {/* sr-only (et non display:none) : le clic sur le label ouvre le sélecteur dans tous les navigateurs. */}
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={saving}
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          {photoError ? (
            <p className="text-xs text-red-600">{photoError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              PNG, JPG ou WebP, 5 Mo maximum, {PRODUCT_PHOTO_MAX} photos au plus. La première est la photo
              principale. Les nouvelles photos sont envoyées avec le produit quand vous enregistrez.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={close} disabled={saving}>
            Annuler
          </Button>
          <Button type="submit" form="product-form" disabled={saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {saving
              ? pending.length
                ? `Enregistrement et envoi de ${pending.length} photo${pending.length > 1 ? "s" : ""}…`
                : "Enregistrement…"
              : productId
                ? "Enregistrer"
                : "Créer le produit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
