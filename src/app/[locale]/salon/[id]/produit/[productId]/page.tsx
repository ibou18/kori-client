"use client";

import { getProductApi } from "@/app/data/services";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { WebBookingCta, WebBookingStepActions } from "../../components/web-booking/WebBookingStepActions";
import { formatCents, productMeta, useProductCart, type PublicProductDetail } from "../../shop";
import { deName } from "../../shop/format";
import { useSalonPublic } from "../../shop/useSalonPublic";
import { SalonThemeProvider } from "../../theme/SalonThemeProvider";

type PickupMode = "rdv" | "seul";

const MODES: { id: PickupMode; label: string; hint: string }[] = [
  { id: "rdv", label: "Pendant mon rendez-vous", hint: "Ajouté à votre réservation, prêt à votre arrivée" },
  {
    id: "seul",
    label: "Retrait au salon sans rendez-vous",
    hint: "Payé en ligne, à récupérer aux heures d'ouverture du salon",
  },
];

/**
 * Fiche produit (maquette Boutique-2) : photo, « Recommandé par … », catégorie ·
 * format, prix, description, conseil du pro, mode de retrait, quantité.
 * - « Pendant mon rendez-vous » : ajout au panier, retour au choix d'une prestation.
 * - « Retrait sans rendez-vous » : commande seule → récapitulatif → Stripe Checkout.
 */
export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;
  const productId = params.productId as string;
  const locale = (params.locale as string) || "fr";
  const backHref = `/${locale}/salon/${salonId}#boutique`;

  const { theme } = useSalonPublic(salonId);
  const cart = useProductCart(salonId);
  const [mode, setMode] = useState<PickupMode>("rdv");
  const [quantity, setQuantity] = useState(1);
  const [photoIndex, setPhotoIndex] = useState(0);

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

  if (isLoading) {
    return (
      <div data-salon-page className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-neutral-900" />
      </div>
    );
  }

  if (!product || product.salon.id !== salonId) {
    return (
      <div data-salon-page className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 text-neutral-700">Ce produit n&apos;est plus disponible.</p>
        <Link href={backHref} className="font-semibold text-neutral-900 underline underline-offset-2">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const maxQuantity = Math.min(20, product.stockQuantity ?? 20);
  const soldOut = !product.inStock || maxQuantity < 1;
  const qty = Math.min(quantity, Math.max(1, maxQuantity));
  const total = formatCents(product.priceCents * qty);
  const pro = product.salon.ownerFirstName;
  const meta = productMeta(product);
  const photos = product.photos.length ? product.photos : [];
  const photo = photos[photoIndex] ?? photos[0];
  const initials = (pro ?? product.salon.name)
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleCta = () => {
    if (soldOut) return;
    if (mode === "rdv") {
      if (cart.has(product.id)) cart.setQuantity(product.id, qty);
      else
        cart.add(
          { productId: product.id, name: product.name, priceCents: product.priceCents, imageUrl: product.mainPhotoUrl },
          qty,
        );
      router.push(`/${locale}/salon/${salonId}#prestations`);
      return;
    }
    router.push(`/${locale}/salon/${salonId}/commande?produit=${product.id}&qte=${qty}`);
  };

  return (
    <SalonThemeProvider theme={theme} className="-mx-4 -mb-12 -mt-4 min-h-screen lg:-mx-8">
      <div className="mx-auto w-full max-w-[640px] md:py-8">
        <div className="flex min-h-screen flex-col bg-site-bg md:min-h-0 md:overflow-hidden md:rounded-3xl md:border md:border-site-border">
          <div className="relative h-[330px] shrink-0 bg-site-media">
            {photo && <Image src={photo.url} alt={photo.alt ?? product.name} fill priority sizes="640px" className="object-cover" />}
            <Link
              href={backHref}
              aria-label="Retour à la boutique"
              className="absolute left-3 top-3 grid size-11 place-items-center rounded-full bg-site-bg text-site-fg shadow-sm"
            >
              <ArrowLeft className="size-5" />
            </Link>
            {pro && (
              <span className="absolute right-3 top-[18px] rounded-full bg-site-accent px-3 py-1 text-xs font-semibold text-site-on-accent">
                Recommandé par {pro}
              </span>
            )}
            {photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={`Photo ${i + 1} sur ${photos.length}`}
                    aria-pressed={i === photoIndex}
                    onClick={() => setPhotoIndex(i)}
                    className="grid size-6 place-items-center"
                  >
                    <span className={cn("size-2 rounded-full bg-site-bg", i !== photoIndex && "opacity-50")} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-3.5 px-5 pb-4 pt-5">
            <div className="flex flex-col gap-1">
              {meta && <p className="text-xs font-semibold uppercase tracking-[1px] text-site-muted">{meta}</p>}
              <h1
                className="font-site-display text-[26px] font-bold leading-[1.15] tracking-[-0.5px]"
                style={{ textTransform: "var(--site-display-transform)" as never }}
              >
                {product.name}
              </h1>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{formatCents(product.priceCents)}</p>
            </div>

            {product.description && <p className="whitespace-pre-line text-sm text-site-fg-2">{product.description}</p>}

            {product.tip && (
              <div className="flex items-start gap-2.5 rounded-[14px] bg-site-surface-2 px-3.5 py-3">
                <div
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-site-accent font-site-display text-xs font-bold text-site-on-accent"
                >
                  {initials}
                </div>
                <p className="text-[13px] text-site-fg-2">
                  <strong className="text-site-fg">
                    {pro ? `Le conseil ${deName(pro)} :` : "Le conseil du salon :"}
                  </strong>{" "}
                  {product.tip}
                </p>
              </div>
            )}

            {soldOut ? (
              <p className="rounded-[14px] border border-site-border px-3.5 py-3 text-sm text-site-fg-2">
                Ce produit est en rupture de stock pour le moment.
              </p>
            ) : (
              <div role="radiogroup" aria-labelledby="pickup-title" className="flex flex-col gap-2">
                <p id="pickup-title" className="text-sm font-semibold">
                  Comment le récupérer ?
                </p>
                {MODES.map((m) => {
                  const checked = m.id === mode;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      onClick={() => setMode(m.id)}
                      className={cn(
                        "flex min-h-14 items-center gap-3 rounded-[14px] px-3.5 py-2 text-left transition-colors",
                        checked ? "border-2 border-site-accent bg-site-surface-2" : "border border-site-border bg-site-bg",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full border-2",
                          checked ? "border-site-accent" : "border-site-border-strong",
                        )}
                      >
                        <span className={cn("size-2.5 rounded-full", checked && "bg-site-accent")} />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold">{m.label}</span>
                        <span className="text-xs text-site-muted">{m.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <WebBookingStepActions>
            <div className="flex items-center gap-3">
              <div role="group" aria-label="Quantité" className="flex shrink-0 items-center rounded-full border border-site-border-strong">
                <button
                  type="button"
                  aria-label="Retirer un"
                  disabled={soldOut || qty <= 1}
                  onClick={() => setQuantity(Math.max(1, qty - 1))}
                  className="grid h-12 w-11 place-items-center disabled:opacity-40"
                >
                  <Minus className="size-4" />
                </button>
                <span aria-live="polite" className="min-w-5 text-center font-semibold tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Ajouter un"
                  disabled={soldOut || qty >= maxQuantity}
                  onClick={() => setQuantity(Math.min(maxQuantity, qty + 1))}
                  className="grid h-12 w-11 place-items-center disabled:opacity-40"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <WebBookingCta type="button" disabled={soldOut} onClick={handleCta} className="flex-1">
                {mode === "rdv" ? `Ajouter au rendez-vous · ${total}` : `Commander · ${total}`}
              </WebBookingCta>
            </div>
          </WebBookingStepActions>
        </div>
      </div>
    </SalonThemeProvider>
  );
}
