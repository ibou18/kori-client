"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";

import { formatCents, productMeta } from "../../shop/format";
import { CART_MAX_QUANTITY } from "../../shop/productCart";
import type { CartItem, PublicProduct } from "../../shop/types";
import { WebBookingCta } from "./WebBookingStepActions";

interface WebBookingProductsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Produits en vente et en stock du salon. */
  products: PublicProduct[];
  cartItems: CartItem[];
  /** 0 = retirer du panier. Appliqué tout de suite : le devis se recalcule derrière. */
  onSetQuantity: (product: PublicProduct, quantity: number) => void;
}

export function maxQuantityFor(product: PublicProduct): number {
  return Math.min(CART_MAX_QUANTITY, product.stockQuantity ?? CART_MAX_QUANTITY);
}

/**
 * Étape paiement : ajouter, retirer ou changer la quantité des produits à
 * récupérer pendant le rendez-vous, sans revenir en arrière dans le parcours.
 */
export function WebBookingProductsDialog({ open, onClose, products, cartItems, onSetQuantity }: WebBookingProductsDialogProps) {
  const quantityOf = (id: string) => cartItems.find((i) => i.productId === id)?.quantity ?? 0;
  const totalCents = cartItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const count = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="z-[110] flex max-h-[90vh] max-w-lg flex-col gap-4 rounded-3xl border-site-border bg-site-bg text-site-fg">
        <DialogHeader>
          <DialogTitle className="pr-8 text-left font-site-display text-xl font-bold">Produits du salon</DialogTitle>
          <DialogDescription className="text-left text-[13px] text-site-muted">
            Payés en entier avec la réservation, prêts à votre arrivée au salon.
          </DialogDescription>
        </DialogHeader>

        {products.length === 0 ? (
          <p className="py-4 text-center text-sm italic text-site-muted">Aucun produit disponible pour le moment.</p>
        ) : (
          <ul className="-mx-1 flex min-h-0 flex-col overflow-y-auto px-1">
            {products.map((product) => {
              const qty = quantityOf(product.id);
              const max = maxQuantityFor(product);
              const meta = productMeta(product);
              return (
                <li key={product.id} className="flex items-center gap-3 border-b border-site-border py-2.5 last:border-b-0">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-[10px] bg-site-media">
                    {product.mainPhotoUrl && (
                      <Image src={product.mainPhotoUrl} alt="" fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-[15px] font-semibold">{product.name}</p>
                    <p className="truncate text-[13px] text-site-fg-2">
                      {[meta, formatCents(product.priceCents)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => onSetQuantity(product, 1)}
                      aria-label={`Ajouter ${product.name}`}
                      className="min-h-10 shrink-0 rounded-full border border-site-accent bg-site-bg px-4 text-sm font-semibold text-site-accent"
                    >
                      Ajouter
                    </button>
                  ) : (
                    <div
                      role="group"
                      aria-label={`Quantité de ${product.name}`}
                      className="flex shrink-0 items-center rounded-full border border-site-border-strong"
                    >
                      <button
                        type="button"
                        onClick={() => onSetQuantity(product, qty - 1)}
                        aria-label={qty === 1 ? `Retirer ${product.name}` : `Retirer un ${product.name}`}
                        className="grid h-10 w-10 place-items-center"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span aria-live="polite" className="min-w-5 text-center text-sm font-semibold tabular-nums">
                        {qty}
                      </span>
                      <button
                        type="button"
                        disabled={qty >= max}
                        onClick={() => onSetQuantity(product, qty + 1)}
                        aria-label={`Ajouter un ${product.name}`}
                        className="grid h-10 w-10 place-items-center disabled:opacity-40"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <WebBookingCta type="button" onClick={onClose}>
          {count > 0 ? `Valider · ${count} produit${count > 1 ? "s" : ""} · ${formatCents(totalCents)}` : "Continuer sans produit"}
        </WebBookingCta>
      </DialogContent>
    </Dialog>
  );
}
