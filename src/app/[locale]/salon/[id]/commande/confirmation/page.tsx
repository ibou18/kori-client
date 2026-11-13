"use client";

import { getProductOrderApi } from "@/app/data/services";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCents } from "../../shop";
import { ShopPageCard, ShopPageHeader } from "../../shop/ShopPageHeader";
import { useSalonPublic } from "../../shop/useSalonPublic";
import { SalonThemeProvider } from "../../theme/SalonThemeProvider";

interface OrderItem {
  id: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  lineTotalCents: number;
}
interface OrderPayload {
  id: string;
  status: string;
  subtotalCents: number;
  items: OrderItem[];
}

const PAID = ["PAID", "READY_FOR_PICKUP", "PICKED_UP"];
const POLL_LIMIT_MS = 30_000;

/**
 * Retour de Stripe Checkout d'une commande en retrait. Le paiement est confirmé par
 * le webhook : on relit la commande jusqu'à PAID (30 s max) avant d'afficher « payé ».
 */
export default function ProductOrderConfirmationPage() {
  const params = useParams();
  const search = useSearchParams();
  const salonId = params.id as string;
  const locale = (params.locale as string) || "fr";
  const orderId = search.get("commande") ?? "";
  const { salon, theme } = useSalonPublic(salonId);

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), POLL_LIMIT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const { data: order, isError } = useQuery({
    queryKey: ["product-order", orderId],
    queryFn: async () => {
      const res = (await getProductOrderApi(orderId)) as { data?: OrderPayload } | null;
      return res?.data ?? null;
    },
    enabled: !!orderId,
    // Relecture toutes les 2 s jusqu'au passage PAID (webhook), arrêt après 30 s.
    refetchInterval: (query) => {
      const data = query.state.data as OrderPayload | null | undefined;
      return (data && PAID.includes(data.status)) || timedOut ? false : 2000;
    },
  });

  const paid = !!order && PAID.includes(order.status);
  const salonHref = `/${locale}/salon/${salonId}`;

  return (
    <SalonThemeProvider theme={theme} className="-mx-4 -mb-12 -mt-4 min-h-screen lg:-mx-8">
      <ShopPageCard>
        <ShopPageHeader salonName={salon?.name ?? ""} title={paid ? "Commande confirmée" : "Votre commande"} />
        <div className="flex flex-1 flex-col gap-5 px-5 pb-8 pt-5">
          {!orderId || isError ? (
            <Status icon={<AlertCircle className="size-6" />} title="Commande introuvable">
              Si vous venez de payer, vous recevrez une confirmation par email.
            </Status>
          ) : !order || (!paid && !timedOut) ? (
            <Status icon={<Loader2 className="size-6 animate-spin" />} title="Confirmation du paiement…">
              Nous attendons la confirmation de Stripe, cela prend quelques secondes.
            </Status>
          ) : !paid ? (
            <Status icon={<AlertCircle className="size-6" />} title="Paiement en cours de vérification">
              Nous n&apos;avons pas encore reçu la confirmation de Stripe. Si un débit apparaît sur votre compte, votre
              commande sera confirmée par email.
            </Status>
          ) : (
            <>
              <Status icon={<CheckCircle2 className="size-6" />} title="C'est payé !">
                Le salon prépare votre commande. Présentez-vous aux heures d&apos;ouverture pour la récupérer.
              </Status>
              <div className="flex flex-col gap-2 rounded-2xl border border-site-border p-3">
                <p className="flex items-center gap-1.5 px-1 text-sm font-semibold">
                  <Store className="size-4" aria-hidden />À récupérer au salon
                </p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-[10px] bg-site-media">
                      {item.productImageUrl && (
                        <Image src={item.productImageUrl} alt="" fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm">
                      <strong className="font-semibold">{item.productName}</strong> × {item.quantity}
                    </p>
                    <span className="rounded-full bg-site-surface-2 px-2.5 py-1 text-xs font-semibold">Payé</span>
                  </div>
                ))}
                <p className="flex justify-between border-t border-site-border px-1 pt-2 text-sm">
                  <span>Total payé</span>
                  <strong className="tabular-nums">{formatCents(order.subtotalCents)}</strong>
                </p>
              </div>
              {salon?.address && (
                <p className="text-sm text-site-fg-2">
                  {salon.name} · {salon.address.street}, {salon.address.city}
                </p>
              )}
            </>
          )}
          <Link
            href={salonHref}
            className="mt-auto flex h-[52px] items-center justify-center rounded-full border border-site-accent font-semibold text-site-accent"
          >
            Retour au salon
          </Link>
        </div>
      </ShopPageCard>
    </SalonThemeProvider>
  );
}

function Status({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-site-surface-2 px-4 py-3.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-site-fg-2">{children}</p>
      </div>
    </div>
  );
}
