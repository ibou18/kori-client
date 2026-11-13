"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CalendarDays, Loader2, PackageCheck, Store } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { AdminProductOrder, ProductOrderStatus } from "./types";
import { useAdminProductOrders, useOrderAction } from "./useShopAdmin";

const cad = (cents: number) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(cents / 100);

const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("fr-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

const STATUS: Record<ProductOrderStatus, { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", variant: "outline" },
  PAID: { label: "Payée — à préparer", variant: "warning" },
  READY_FOR_PICKUP: { label: "Prête", variant: "default" },
  PICKED_UP: { label: "Remise", variant: "success" },
  CANCELLED: { label: "Abandonnée", variant: "outline" },
  REFUNDED: { label: "Remboursée", variant: "secondary" },
};

const FILTERS: { key: string; label: string; status?: ProductOrderStatus }[] = [
  { key: "all", label: "Toutes" },
  { key: "PAID", label: "À préparer", status: "PAID" },
  { key: "READY_FOR_PICKUP", label: "Prêtes", status: "READY_FOR_PICKUP" },
  { key: "PICKED_UP", label: "Remises", status: "PICKED_UP" },
  { key: "REFUNDED", label: "Remboursées", status: "REFUNDED" },
];

/** Commandes de produits du salon : à préparer, prêtes, remises ; annulation = remboursement intégral. */
export function OrdersPanel({ salonId }: { salonId: string }) {
  const [filter, setFilter] = useState("all");
  const status = FILTERS.find((f) => f.key === filter)?.status;
  const { data: orders = [], isLoading } = useAdminProductOrders(salonId, status);
  const action = useOrderAction(salonId);
  const [cancelling, setCancelling] = useState<AdminProductOrder | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              filter === f.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          Aucune commande pour le moment.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => {
            const s = STATUS[order.status];
            const busy = action.isPending && action.variables?.id === order.id;
            const clientName = [order.client.firstName, order.client.lastName].filter(Boolean).join(" ") || "Client";
            const canReady = order.status === "PAID" && order.fulfillmentMode === "PICKUP";
            const canPickUp = order.status === "PAID" || order.status === "READY_FOR_PICKUP";
            return (
              <li key={order.id} className="flex flex-col gap-3 rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold">{clientName}</p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {order.fulfillmentMode === "WITH_BOOKING" && order.booking ? (
                        <>
                          <CalendarDays className="size-4" />
                          Avec le rendez-vous du {dateTime(order.booking.appointmentStartDateTime)}
                        </>
                      ) : (
                        <>
                          <Store className="size-4" />
                          Retrait sans rendez-vous · payée le {order.paidAt ? dateTime(order.paidAt) : "—"}
                        </>
                      )}
                    </p>
                    {order.client.phone && <p className="text-sm text-muted-foreground">{order.client.phone}</p>}
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>

                <ul className="flex flex-col gap-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 text-sm">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.productImageUrl && (
                          <Image src={item.productImageUrl} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="tabular-nums">{cad(item.lineTotalCents)}</span>
                    </li>
                  ))}
                </ul>

                {order.clientNotes && (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm">
                    <span className="font-medium">Note du client : </span>
                    {order.clientNotes}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                  <p className="text-sm text-muted-foreground">
                    Payé {cad(order.subtotalCents)} · commission korí {cad(order.commissionCents)} ·{" "}
                    <span className="font-medium text-foreground">vous recevez {cad(order.salonAmountCents)}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {canReady && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => action.mutate({ id: order.id, action: "ready" })}>
                        Marquer prête
                      </Button>
                    )}
                    {canPickUp && (
                      <Button size="sm" disabled={busy} onClick={() => action.mutate({ id: order.id, action: "picked-up" })}>
                        {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <PackageCheck className="mr-1.5 size-4" />}
                        Remise au client
                      </Button>
                    )}
                    {canPickUp && (
                      <Button size="sm" variant="ghost" disabled={busy} onClick={() => setCancelling(order)}>
                        Annuler et rembourser
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler cette commande ?</DialogTitle>
            <DialogDescription>
              Le client est remboursé en entier ({cancelling ? cad(cancelling.subtotalCents) : ""}) et le stock est
              recrédité. Cette action est définitive.
              {cancelling?.fulfillmentMode === "WITH_BOOKING" && " Le rendez-vous associé n'est pas annulé."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelling(null)}>
              Garder la commande
            </Button>
            <Button
              variant="destructive"
              disabled={action.isPending}
              onClick={() =>
                cancelling &&
                action.mutate({ id: cancelling.id, action: "cancel" }, { onSettled: () => setCancelling(null) })
              }
            >
              {action.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Annuler et rembourser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
