"use client";

import { cn } from "@/lib/utils";
import { OWNER } from "@/shared/constantes";
import { AlertTriangle, ArrowRight, Clock, CreditCard } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ENCAISSEMENT_PATH, type StripeConnectStatus, useMyStripeAccount } from "./useStripeConnect";

const COPY: Partial<
  Record<StripeConnectStatus, { title: string; text: string; cta: string; tone: "brand" | "amber" | "blue" }>
> = {
  NOT_STARTED: {
    tone: "brand",
    title: "Activez l'encaissement en ligne",
    text: "Acomptes à la réservation et vente de produits, versés directement sur votre compte bancaire.",
    cta: "Activer",
  },
  INCOMPLETE: {
    tone: "amber",
    title: "Terminez la configuration de vos paiements",
    text: "Vos réponses sont conservées : il ne reste que quelques étapes.",
    cta: "Reprendre",
  },
  ACTION_REQUIRED: {
    tone: "amber",
    title: "Stripe a besoin d'informations",
    text: "Complétez-les pour activer ou garder actifs vos paiements en ligne.",
    cta: "Compléter",
  },
  IN_REVIEW: {
    tone: "blue",
    title: "Vérification de vos paiements en cours",
    text: "Stripe vérifie vos informations. Vous recevrez un courriel dès que c'est actif.",
    cta: "Voir",
  },
};

const TONES = {
  brand: "border-[#34503F]/20 bg-[#F0F4F1] text-[#34503F]",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  blue: "border-sky-200 bg-sky-50 text-sky-900",
};

/**
 * Rappel compact vers la page Encaissement, affiché tant que le compte de paiement
 * n'est pas actif (tableau de bord, Ma boutique). Rien n'est affiché une fois actif
 * ou si l'état n'a pas pu être lu.
 */
export function StripeSetupBanner({ className }: { className?: string }) {
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const { data: session } = useSession();
  const isOwner = (session?.user as { role?: string } | undefined)?.role === OWNER;
  const { data } = useMyStripeAccount({ enabled: isOwner });
  const copy = data ? COPY[data.status] : undefined;
  if (!isOwner || !copy) return null;

  const Icon = copy.tone === "brand" ? CreditCard : copy.tone === "amber" ? AlertTriangle : Clock;

  return (
    <Link
      href={`/${locale}${ENCAISSEMENT_PATH}`}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow-sm",
        TONES[copy.tone],
        className,
      )}
    >
      <Icon className="size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{copy.title}</p>
        <p className="text-sm opacity-80">{copy.text}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold">
        {copy.cta}
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
