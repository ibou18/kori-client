"use client";

import { Store } from "lucide-react";
import { deName, queName } from "./format";
import { ProductCard } from "./ProductCard";
import { useProductCart } from "./productCart";
import type { PublicProduct } from "./types";

export function productHref(locale: string, salonId: string, productId: string) {
  return `/${locale}/salon/${salonId}/produit/${productId}`;
}

function useToggle(salonId: string) {
  const cart = useProductCart(salonId);
  return {
    cart,
    toggle: (product: PublicProduct) =>
      cart.has(product.id)
        ? cart.remove(product.id)
        : cart.add({
            productId: product.id,
            name: product.name,
            priceCents: product.priceCents,
            imageUrl: product.mainPhotoUrl,
          }),
  };
}

/** Onglet Boutique (maquette) : intro, mention « Retrait au salon », grille de produits. */
export function SalonShop({
  salonId,
  locale,
  products,
  proFirstName,
  disabled = false,
}: {
  salonId: string;
  locale: string;
  products: PublicProduct[];
  proFirstName: string | null;
  disabled?: boolean;
}) {
  const { cart, toggle } = useToggle(salonId);
  return (
    <section className="flex flex-col gap-4 px-5 pb-8 pt-5">
      <div className="flex flex-col gap-1">
        <h2
          className="font-site-display text-2xl font-bold tracking-[-0.3px]"
          style={{ textTransform: "var(--site-display-transform)" as never }}
        >
          Boutique
        </h2>
        <p className="text-sm text-site-fg-2">
          {proFirstName ? `Les soins ${queName(proFirstName)} utilise au salon.` : "Les soins utilisés au salon."} À
          récupérer pendant votre rendez-vous ou sur place.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-site-surface-2 px-4 py-3 text-[13px]">
        <span className="flex items-center gap-1.5 font-semibold">
          <Store className="size-4" aria-hidden />
          Retrait au salon
        </span>
        <span className="text-site-muted">Payé en ligne, prêt à votre arrivée</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            href={productHref(locale, salonId, product.id)}
            inCart={cart.has(product.id)}
            onToggle={() => !disabled && toggle(product)}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}

/** Encart « Les produits de … » sous les prestations (carrousel + lien vers l'onglet Boutique). */
export function SalonShopTeaser({
  salonId,
  locale,
  products,
  proFirstName,
  onShowShop,
  disabled = false,
}: {
  salonId: string;
  locale: string;
  products: PublicProduct[];
  proFirstName: string | null;
  onShowShop: () => void;
  disabled?: boolean;
}) {
  const { cart, toggle } = useToggle(salonId);
  if (products.length === 0) return null;
  const title = proFirstName ? `Les produits ${deName(proFirstName)}` : "Les produits du salon";
  return (
    <section aria-label="Produits recommandés" className="flex flex-col gap-3 border-t border-site-border px-5 pb-8 pt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          className="font-site-display text-xl font-bold tracking-[-0.2px]"
          style={{ textTransform: "var(--site-display-transform)" as never }}
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onShowShop}
          className="flex min-h-11 shrink-0 items-center text-sm font-semibold text-site-accent hover:underline"
        >
          Voir la boutique
        </button>
      </div>
      <p className="-mt-2 text-sm text-site-fg-2">
        Utilisés au salon. Ajoutez-les à votre rendez-vous, ils vous attendront sur place.
      </p>
      <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {products.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            compact
            product={product}
            href={productHref(locale, salonId, product.id)}
            inCart={cart.has(product.id)}
            onToggle={() => !disabled && toggle(product)}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}
