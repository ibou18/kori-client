"use client";

import { getBookingApi } from "@/app/data/services";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Store } from "lucide-react";
import { useEffect } from "react";
import { useProductCart } from "../shop/productCart";

interface BookingWithProducts {
  appointmentStartDateTime?: string;
  productOrder?: {
    status: string;
    items: { id: string; productName: string; quantity: number }[];
  } | null;
}

/**
 * Réservation payée : vide le panier boutique du salon (les produits sont rattachés
 * à la réservation) et liste les produits à récupérer le jour du rendez-vous.
 */
export function BookingProductsRecap({ salonId, bookingId }: { salonId: string; bookingId?: string }) {
  const cart = useProductCart(salonId);
  const clearCart = cart.clear;

  useEffect(() => {
    clearCart();
    // Une seule fois, au retour d'un paiement confirmé.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: booking } = useQuery({
    queryKey: ["booking-products", bookingId],
    queryFn: async () => {
      try {
        const res = (await getBookingApi(bookingId!)) as { data?: BookingWithProducts } | null;
        return res?.data ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!bookingId,
  });

  const items = booking?.productOrder?.items ?? [];
  if (items.length === 0) return null;
  const date = booking?.appointmentStartDateTime ? new Date(booking.appointmentStartDateTime) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        <Store className="size-4" aria-hidden />
        À récupérer au salon{date ? ` le ${format(date, "d MMMM", { locale: fr })}` : ""}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <span className="min-w-0 truncate">
              {item.productName} × {item.quantity}
            </span>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold">Payé</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
