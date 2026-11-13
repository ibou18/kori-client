"use client";

import { ShoppingBag } from "lucide-react";
import { formatCents } from "./format";
import { useProductCart } from "./productCart";

/**
 * Barre panier collée en bas de la page salon (maquette) : nombre de produits,
 * total, et « Réserver avec » qui renvoie au choix d'une prestation — les produits
 * sont ajoutés à la réservation (étape créneau) puis payés avec elle.
 */
export function CartBar({ salonId, onChooseService }: { salonId: string; onChooseService: () => void }) {
  const cart = useProductCart(salonId);
  if (cart.count === 0) return null;
  return (
    <div className="sticky bottom-3 z-30 mx-3 mb-3 flex items-center gap-3 rounded-[18px] bg-site-accent py-2.5 pl-4 pr-2.5 text-site-on-accent shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] lg:mx-auto lg:max-w-md">
      <ShoppingBag className="size-5 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-sm font-semibold">
          {cart.count} produit{cart.count > 1 ? "s" : ""}
        </span>
        <span className="text-xs opacity-80 tabular-nums">{formatCents(cart.totalCents)} · à récupérer au salon</span>
      </div>
      <button
        type="button"
        onClick={onChooseService}
        className="flex min-h-11 shrink-0 items-center rounded-full bg-site-bg px-4 text-sm font-semibold text-site-fg"
      >
        Réserver avec
      </button>
    </div>
  );
}
