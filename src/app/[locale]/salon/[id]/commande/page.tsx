"use client";

import { createProductOrderApi, createProductOrderCheckoutApi, getProductApi } from "@/app/data/services";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock, Store } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ClientQuickAuthPanel } from "../components/web-booking/ClientQuickAuthPanel";
import { WebBookingCta, WebBookingStepActions } from "../components/web-booking/WebBookingStepActions";
import { formatCents, productMeta, readApiError, type PublicProductDetail } from "../shop";
import { ShopPageCard, ShopPageHeader } from "../shop/ShopPageHeader";
import { useSalonPublic } from "../shop/useSalonPublic";
import { SalonThemeProvider } from "../theme/SalonThemeProvider";

/**
 * Commande en retrait au salon sans rendez-vous : récapitulatif, connexion si besoin,
 * note facultative, puis paiement intégral sur Stripe Checkout (le salon reçoit le
 * prix moins la commission korí, le client paie le prix affiché).
 */
export default function ProductOrderPage() {
  const params = useParams();
  const search = useSearchParams();
  const salonId = params.id as string;
  const locale = (params.locale as string) || "fr";
  const productId = search.get("produit") ?? "";
  const requestedQty = Math.max(1, Math.min(20, Number(search.get("qte")) || 1));
  const productHref = `/${locale}/salon/${salonId}/produit/${productId}`;

  const { status } = useSession();
  const authenticated = status === "authenticated";
  const { salon, theme } = useSalonPublic(salonId);
  const [notes, setNotes] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      try {
        const res = (await getProductApi(productId)) as { data?: PublicProductDetail } | null;
        return res?.data ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!productId,
  });

  const qty = product?.stockQuantity != null ? Math.min(requestedQty, product.stockQuantity) : requestedQty;
  const totalCents = (product?.priceCents ?? 0) * qty;
  const summary = product ? { label: `${product.name} × ${qty}`, price: formatCents(totalCents) } : null;
  const salonName = salon?.name ?? product?.salon.name ?? "";

  const pay = async () => {
    if (!product) return;
    setError(null);
    setPaying(true);
    try {
      const orderRes = (await createProductOrderApi({
        salonId,
        items: [{ productId: product.id, quantity: qty }],
        ...(notes.trim() ? { clientNotes: notes.trim() } : {}),
      })) as { data?: { id?: string } } | null;
      const orderId = orderRes?.data?.id;
      if (!orderId) throw new Error("Commande non créée");

      const origin = window.location.origin;
      const checkoutRes = (await createProductOrderCheckoutApi(orderId, {
        successUrl: `${origin}/${locale}/salon/${salonId}/commande/confirmation?commande=${orderId}`,
        cancelUrl: `${origin}${productHref}`,
      })) as { data?: { sessionUrl?: string } } | null;
      const url = checkoutRes?.data?.sessionUrl;
      if (!url) throw new Error("Paiement indisponible");
      window.location.href = url;
    } catch (e) {
      setError(readApiError(e).message);
      setPaying(false);
    }
  };

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  } else if (!product || product.salon.id !== salonId || !product.inStock) {
    body = (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-20 text-center">
        <p className="text-site-fg-2">Ce produit n&apos;est plus disponible.</p>
        <Link href={`/${locale}/salon/${salonId}#boutique`} className="font-semibold underline underline-offset-2">
          Retour à la boutique
        </Link>
      </div>
    );
  } else if (!authenticated) {
    body = <ClientQuickAuthPanel onAuthenticated={() => undefined} summary={summary} />;
  } else {
    body = (
      <>
        <div className="flex flex-1 flex-col gap-[18px] px-5 pb-5 pt-5">
          <div className="flex items-center gap-3 rounded-2xl border border-site-border bg-site-surface-2 p-2.5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-site-media">
              {product.mainPhotoUrl && <Image src={product.mainPhotoUrl} alt="" fill sizes="64px" className="object-cover" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate font-semibold">{product.name}</p>
              {productMeta(product) && <p className="truncate text-[13px] text-site-muted">{productMeta(product)}</p>}
              <p className="text-[13px] text-site-fg-2">
                Qté {qty} · {formatCents(product.priceCents)}
              </p>
            </div>
            <span className="shrink-0 pr-1.5 font-bold tabular-nums">{formatCents(totalCents)}</span>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-site-surface-2 px-4 py-3.5 text-sm">
            <Store className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold">Retrait au salon sans rendez-vous</p>
              <p className="text-site-fg-2">
                Le salon prépare votre commande ; vous la récupérez aux heures d&apos;ouverture
                {salon?.address ? `, ${salon.address.street}, ${salon.address.city}` : ""}.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="order-notes" className="text-sm font-medium">
              Une précision pour le salon ? <span className="font-normal text-site-muted">(facultatif)</span>
            </label>
            <textarea
              id="order-notes"
              value={notes}
              maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-site-border-strong bg-site-bg px-3.5 py-3 text-[15px] focus:border-site-accent focus:outline-none"
            />
          </div>

          <div className="flex items-baseline justify-between border-t border-site-border pt-3">
            <span className="text-base font-bold">À payer maintenant</span>
            <span className="text-lg font-bold tabular-nums">{formatCents(totalCents)}</span>
          </div>
          <p className="-mt-3 text-[13px] text-site-muted">Prix toutes taxes comprises, fixé par le salon.</p>

          {error && <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>

        <WebBookingStepActions>
          <WebBookingCta type="button" disabled={paying} onClick={pay}>
            {paying ? <Loader2 className="size-5 animate-spin" /> : `Payer ${formatCents(totalCents)}`}
          </WebBookingCta>
          <p className="flex items-center justify-center gap-1.5 text-xs text-site-muted">
            <Lock className="size-3.5" />
            Paiement sécurisé et chiffré par Stripe
          </p>
        </WebBookingStepActions>
      </>
    );
  }

  return (
    <SalonThemeProvider theme={theme} className="-mx-4 -mb-12 -mt-4 min-h-screen lg:-mx-8">
      <ShopPageCard>
        <ShopPageHeader
          salonName={salonName}
          title={authenticated || !product ? "Votre commande" : "Vos coordonnées"}
          backHref={productHref}
        />
        {body}
      </ShopPageCard>
    </SalonThemeProvider>
  );
}
