"use client";

import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCents, productMeta } from "./format";
import type { PublicProduct } from "./types";

/**
 * Carte produit (maquette Boutique) : photo carrée, nom, catégorie · format, prix
 * et bouton « Ajouter » / « Ajouté » qui bascule le produit dans le panier.
 */
export function ProductCard({
  product,
  href,
  inCart,
  onToggle,
  disabled = false,
  compact = false,
}: {
  product: PublicProduct;
  href: string;
  inCart: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** Carrousel horizontal de l'onglet Prestations : pas de ligne catégorie. */
  compact?: boolean;
}) {
  const meta = productMeta(product);
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", compact && "w-[150px] shrink-0")}>
      <Link
        href={href}
        aria-label={product.name}
        aria-disabled={disabled}
        onClick={(e) => disabled && e.preventDefault()}
        className="relative aspect-square overflow-hidden rounded-2xl bg-site-media"
      >
        {product.mainPhotoUrl && (
          <Image src={product.mainPhotoUrl} alt="" fill sizes="(min-width: 768px) 220px, 45vw" className="object-cover" />
        )}
      </Link>
      <p className="line-clamp-2 text-sm font-semibold leading-[1.3]">{product.name}</p>
      {!compact && meta && <p className="truncate text-xs text-site-muted">{meta}</p>}
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-sm font-bold tabular-nums">{formatCents(product.priceCents)}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={inCart}
          aria-disabled={disabled}
          aria-label={inCart ? `Retirer ${product.name} du panier` : `Ajouter ${product.name} au panier`}
          className={cn(
            "flex min-h-9 items-center gap-1 rounded-full border px-3 text-xs font-semibold transition-colors",
            inCart
              ? "border-site-accent bg-site-accent text-site-on-accent"
              : "border-site-accent bg-site-bg text-site-accent hover:bg-site-accent hover:text-site-on-accent",
          )}
        >
          {inCart ? <Check className="size-3.5" strokeWidth={2.5} /> : <Plus className="size-3.5" strokeWidth={2.5} />}
          {inCart ? "Ajouté" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
