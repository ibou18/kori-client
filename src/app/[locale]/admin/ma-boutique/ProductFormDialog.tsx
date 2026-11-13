"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EMPTY_PRODUCT_FORM, formToPayload, productToForm, type ProductFormValues } from "./productForm";
import type { AdminProduct } from "./types";
import { useProductMutations } from "./useShopAdmin";

const MAX_PHOTOS = 6;

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
 * Création / modification d'un produit. Les photos s'ajoutent une fois le produit
 * enregistré : après une création, la fenêtre bascule sur le produit créé.
 */
export function ProductFormDialog({
  salonId,
  open,
  onOpenChange,
  product,
  services,
  onCreated,
}: {
  salonId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = création. Toujours la version fraîche (relue depuis la liste). */
  product: AdminProduct | null;
  services: { id: string; name: string }[];
  /** Après création : la page passe le produit créé (pour ajouter les photos). */
  onCreated?: (productId: string) => void;
}) {
  const { create, update, uploadPhoto, deletePhoto } = useProductMutations(salonId);
  const [form, setForm] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [createdId, setCreatedId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const productId = product?.id ?? createdId;

  // Réinitialise à l'ouverture (et seulement à l'ouverture : pas à chaque relecture de la liste).
  useEffect(() => {
    if (!open) return;
    setForm(product ? productToForm(product) : EMPTY_PRODUCT_FORM);
    setErrors({});
    setCreatedId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = formToPayload(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    if (productId) {
      update.mutate({ id: productId, data: result.payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(result.payload, {
        onSuccess: (res) => {
          const id = res.data?.id ?? null;
          setCreatedId(id);
          if (id) onCreated?.(id);
        },
      });
    }
  };

  const photos = product?.photos ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          {!productId ? (
            <p className="text-xs text-muted-foreground">Enregistrez le produit pour ajouter ses photos.</p>
          ) : (
            <>
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
                      disabled={deletePhoto.isPending}
                      onClick={() => deletePhoto.mutate({ id: productId, photoId: photo.id })}
                      className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploadPhoto.isPending}
                    className="grid size-20 place-items-center rounded-lg border border-dashed text-muted-foreground hover:bg-accent"
                    aria-label="Ajouter une photo"
                  >
                    {uploadPhoto.isPending ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou WebP, 5 Mo maximum, {MAX_PHOTOS} photos au plus. La première est la photo principale.
              </p>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto.mutate({ id: productId, file });
                  e.target.value = "";
                }}
              />
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {productId ? "Fermer" : "Annuler"}
          </Button>
          <Button type="submit" form="product-form" disabled={saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {productId ? "Enregistrer" : "Créer le produit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
