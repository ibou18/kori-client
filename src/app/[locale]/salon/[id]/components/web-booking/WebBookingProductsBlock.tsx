"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCents } from "../../shop/format";
import type { CartItem, PublicProduct } from "../../shop/types";

/**
 * Étape créneau (maquette Boutique-3) : produits du panier à récupérer pendant le
 * rendez-vous (retirables), puis suggestions « Souvent pris avec … » : produits
 * que le salon associe aux prestations choisies et qui ne sont pas encore pris.
 */
export function WebBookingProductsBlock({
  cartItems,
  suggestions,
  suggestionTitle,
  shopHref,
  onRemove,
  onAdd,
}: {
  cartItems: CartItem[];
  suggestions: PublicProduct[];
  suggestionTitle: string;
  shopHref: string;
  onRemove: (productId: string) => void;
  onAdd: (product: PublicProduct) => void;
}) {
  if (cartItems.length === 0 && suggestions.length === 0) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold">Produits à récupérer au salon</p>
        <Link href={shopHref} className="flex min-h-11 items-center text-sm font-semibold text-site-accent hover:underline">
          Boutique
        </Link>
      </div>

      {cartItems.map((item) => (
        <div key={item.productId} className="flex items-center gap-3 rounded-[14px] border border-site-border p-2">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-[10px] bg-site-media">
            {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-sm font-semibold">{item.name}</p>
            <p className="text-[13px] text-site-fg-2">
              Qté {item.quantity} · {formatCents(item.priceCents * item.quantity)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            aria-label={`Retirer ${item.name}`}
            className="grid size-11 place-items-center rounded-full text-site-muted hover:bg-site-surface"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2 rounded-[14px] bg-site-surface-2 p-3">
          <p className="text-[13px] font-semibold">{suggestionTitle}</p>
          {suggestions.map((product) => (
            <div key={product.id} className="flex items-center gap-2.5">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-site-media">
                {product.mainPhotoUrl && <Image src={product.mainPhotoUrl} alt="" fill sizes="40px" className="object-cover" />}
              </div>
              <p className="min-w-0 flex-1 text-[13px]">
                <strong className="font-semibold">{product.name}</strong> · {formatCents(product.priceCents)}
              </p>
              <button
                type="button"
                onClick={() => onAdd(product)}
                aria-label={`Ajouter ${product.name}`}
                className="min-h-9 shrink-0 rounded-full border border-site-accent bg-site-bg px-3 text-xs font-semibold text-site-accent"
              >
                Ajouter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
