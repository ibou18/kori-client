import type { AdminProduct, ProductPayload } from "./types";

/** Valeurs du formulaire (texte saisi) ; le prix est saisi en dollars, envoyé en centimes. */
export interface ProductFormValues {
  name: string;
  price: string;
  category: string;
  size: string;
  description: string;
  tip: string;
  trackStock: boolean;
  stock: string;
  isActive: boolean;
  recommendedServiceIds: string[];
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  price: "",
  category: "",
  size: "",
  description: "",
  tip: "",
  trackStock: false,
  stock: "",
  isActive: true,
  recommendedServiceIds: [],
};

export function productToForm(product: AdminProduct): ProductFormValues {
  return {
    name: product.name,
    price: (product.priceCents / 100).toFixed(2).replace(".", ","),
    category: product.category ?? "",
    size: product.size ?? "",
    description: product.description ?? "",
    tip: product.tip ?? "",
    trackStock: product.stockQuantity !== null,
    stock: product.stockQuantity !== null ? String(product.stockQuantity) : "",
    isActive: product.isActive,
    recommendedServiceIds: product.recommendedServices.map((s) => s.id),
  };
}

/** « 24,50 » / « 24.5 » / « 24 » → 2450. null si invalide. */
export function parsePriceToCents(value: string): number | null {
  const normalized = value.replace(/\s|\$/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return cents > 0 ? cents : null;
}

/** Valide le formulaire ; renvoie la charge utile serveur ou les erreurs par champ. */
export function formToPayload(
  form: ProductFormValues,
): { ok: true; payload: ProductPayload } | { ok: false; errors: Partial<Record<keyof ProductFormValues, string>> } {
  const errors: Partial<Record<keyof ProductFormValues, string>> = {};
  const name = form.name.trim();
  if (!name) errors.name = "Le nom est requis.";
  const priceCents = parsePriceToCents(form.price);
  if (priceCents === null) errors.price = "Prix invalide (ex. 24,00).";
  let stockQuantity: number | null = null;
  if (form.trackStock) {
    const stock = Number(form.stock);
    if (form.stock.trim() === "" || !Number.isInteger(stock) || stock < 0) {
      errors.stock = "Indiquez un nombre entier (0 ou plus).";
    } else {
      stockQuantity = stock;
    }
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  const text = (v: string) => v.trim() || null;
  return {
    ok: true,
    payload: {
      name,
      priceCents: priceCents!,
      category: text(form.category),
      size: text(form.size),
      description: text(form.description),
      tip: text(form.tip),
      stockQuantity,
      isActive: form.isActive,
      recommendedServiceIds: form.recommendedServiceIds,
    },
  };
}
