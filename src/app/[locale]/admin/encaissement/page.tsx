"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OWNER } from "@/shared/constantes";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarCheck,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  IdCard,
  Landmark,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import {
  STRIPE_CONNECT_KEY,
  type StripeConnectOverview,
  type StripeConnectStatus,
  useMyStripeAccount,
  useOpenStripeDashboard,
  useStartStripeOnboarding,
} from "./useStripeConnect";

dayjs.locale("fr");

/**
 * Espace pro — Encaissement en ligne (Stripe Connect).
 *
 * Le propriétaire crée et complète son compte de paiement sans quitter le web :
 * le formulaire est hébergé par Stripe, qui ramène ici avec `?stripe=retour`
 * (formulaire envoyé) ou `?stripe=expire` (lien expiré : on en rouvre un).
 */
export default function EncaissementPage() {
  return (
    <Suspense fallback={<CenteredSpinner />}>
      <EncaissementContent />
    </Suspense>
  );
}

function EncaissementContent() {
  const { data: session, status: sessionStatus } = useSession();
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const role = (session?.user as { role?: string } | undefined)?.role;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const stripeParam = searchParams.get("stripe");
  const returnedFromStripe = stripeParam === "retour";

  const isOwner = role === OWNER;
  const { data: account, isLoading, isError, refetch, isFetching } = useMyStripeAccount({
    pollWhilePending: returnedFromStripe,
    enabled: isOwner,
  });
  const onboarding = useStartStripeOnboarding(locale);
  const dashboard = useOpenStripeDashboard();

  // Lien Stripe expiré (ou page rechargée) : on en génère un nouveau aussitôt.
  const relaunched = useRef(false);
  useEffect(() => {
    if (stripeParam === "expire" && isOwner && !relaunched.current) {
      relaunched.current = true;
      onboarding.mutate();
    }
  }, [stripeParam, isOwner, onboarding]);

  // Retour du formulaire : relire l'état tout de suite.
  useEffect(() => {
    if (returnedFromStripe) {
      queryClient.invalidateQueries({ queryKey: [STRIPE_CONNECT_KEY] });
    }
  }, [returnedFromStripe, queryClient]);

  if (sessionStatus === "loading") return <CenteredSpinner />;

  if (!isOwner) {
    return (
      <PageWrapper title="Encaissement en ligne">
        <p className="text-sm text-muted-foreground">
          Seul le propriétaire du salon peut configurer l&apos;encaissement en ligne.
        </p>
      </PageWrapper>
    );
  }

  if (stripeParam === "expire") {
    return (
      <CenteredSpinner label="Nous rouvrons la configuration de vos paiements…">
        {onboarding.isError && (
          <Button variant="outline" className="mt-4" onClick={() => onboarding.mutate()}>
            Réessayer
          </Button>
        )}
      </CenteredSpinner>
    );
  }

  const dismissReturn = () => router.replace(pathname);

  return (
    <PageWrapper
      title="Encaissement en ligne"
      description="Recevez les acomptes et les achats de vos clients directement sur votre compte bancaire."
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError || !account ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
            <p className="font-semibold">Impossible de récupérer l&apos;état de votre compte de paiement.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 size-4" />
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            {returnedFromStripe && (
              <ReturnNotice status={account.status} onDismiss={dismissReturn} />
            )}

            <StatusCard
              account={account}
              onStart={() => onboarding.mutate()}
              starting={onboarding.isPending}
              onOpenDashboard={() => dashboard.mutate()}
              openingDashboard={dashboard.isPending}
              onRefresh={() => refetch()}
              refreshing={isFetching}
            />

            <Progress status={account.status} />

            {account.status === "ACTIVE" ? (
              <Unlocked account={account} locale={locale} />
            ) : (
              <WhatYouNeed />
            )}

            <Faq />
          </>
        )}
      </div>
    </PageWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Carte principale : un message et une action selon l'état du compte
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COPY: Record<
  StripeConnectStatus,
  { tone: "neutral" | "amber" | "blue" | "green"; title: string; text: string; cta?: string }
> = {
  NOT_STARTED: {
    tone: "neutral",
    title: "Activez l'encaissement en ligne",
    text: "Encaissez des acomptes à la réservation et vendez vos produits sur votre page korí. L'argent est versé automatiquement sur votre compte bancaire.",
    cta: "Commencer la configuration",
  },
  INCOMPLETE: {
    tone: "amber",
    title: "Votre configuration n'est pas terminée",
    text: "Vous avez commencé à remplir le formulaire Stripe. Reprenez là où vous vous êtes arrêté : vos réponses sont conservées.",
    cta: "Reprendre la configuration",
  },
  ACTION_REQUIRED: {
    tone: "amber",
    title: "Stripe a besoin de quelques informations",
    text: "Pour activer ou garder actifs vos paiements, complétez les informations demandées par Stripe.",
    cta: "Compléter mes informations",
  },
  IN_REVIEW: {
    tone: "blue",
    title: "Vérification en cours",
    text: "Stripe vérifie vos informations. C'est souvent fait en quelques minutes, parfois jusqu'à 2 jours ouvrables. Vous recevrez un courriel dès que vos paiements seront actifs.",
  },
  ACTIVE: {
    tone: "green",
    title: "Vos paiements en ligne sont actifs",
    text: "Les paiements de vos clients sont versés automatiquement sur votre compte bancaire. Consultez votre solde et vos virements depuis votre tableau de bord Stripe.",
  },
};

const TONES = {
  neutral: { card: "border-[#34503F]/20 bg-[#F0F4F1]", icon: "bg-[#34503F] text-white" },
  amber: { card: "border-amber-200 bg-amber-50", icon: "bg-amber-500 text-white" },
  blue: { card: "border-sky-200 bg-sky-50", icon: "bg-sky-600 text-white" },
  green: { card: "border-emerald-200 bg-emerald-50", icon: "bg-emerald-600 text-white" },
};

const STATUS_ICON: Record<StripeConnectStatus, typeof CreditCard> = {
  NOT_STARTED: CreditCard,
  INCOMPLETE: ArrowRight,
  ACTION_REQUIRED: AlertTriangle,
  IN_REVIEW: Clock,
  ACTIVE: BadgeCheck,
};

function StatusCard({
  account,
  onStart,
  starting,
  onOpenDashboard,
  openingDashboard,
  onRefresh,
  refreshing,
}: {
  account: StripeConnectOverview;
  onStart: () => void;
  starting: boolean;
  onOpenDashboard: () => void;
  openingDashboard: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const copy = STATUS_COPY[account.status];
  const tone = TONES[copy.tone];
  const Icon = STATUS_ICON[account.status];
  const canOpenDashboard = account.detailsSubmitted;

  return (
    <section className={cn("rounded-2xl border p-6", tone.card)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", tone.icon)}>
          <Icon className="size-6" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">{copy.title}</h2>
          <p className="text-sm leading-relaxed text-slate-700">{copy.text}</p>

          {account.status === "ACTION_REQUIRED" && (
            <p className="text-sm font-medium text-amber-900">
              {account.requirementsCount > 1
                ? `${account.requirementsCount} informations à fournir`
                : "1 information à fournir"}
              {account.currentDeadline &&
                ` · avant le ${dayjs(account.currentDeadline).format("D MMMM YYYY")}`}
            </p>
          )}

          {account.hasAccount && (
            <div className="mt-1 flex flex-wrap gap-2">
              <Capability ok={account.chargesEnabled} label="Encaissements" />
              <Capability ok={account.payoutsEnabled} label="Virements vers votre banque" />
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {copy.cta && (
              <Button
                size="lg"
                onClick={onStart}
                disabled={starting}
                className="bg-[#34503F] text-white hover:bg-[#2a4133]"
              >
                {starting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 size-4" />
                )}
                {starting ? "Ouverture de Stripe…" : copy.cta}
              </Button>
            )}
            {canOpenDashboard && (
              <Button
                size="lg"
                variant={copy.cta ? "outline" : "default"}
                onClick={onOpenDashboard}
                disabled={openingDashboard}
                className={cn(!copy.cta && "bg-[#34503F] text-white hover:bg-[#2a4133]")}
              >
                {openingDashboard ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 size-4" />
                )}
                Mon tableau de bord Stripe
              </Button>
            )}
            {account.status === "IN_REVIEW" && (
              <Button size="lg" variant="ghost" onClick={onRefresh} disabled={refreshing}>
                <RefreshCw className={cn("mr-2 size-4", refreshing && "animate-spin")} />
                Actualiser
              </Button>
            )}
          </div>

          {account.status === "NOT_STARTED" && (
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <LockKeyhole className="size-3.5 shrink-0" />
              Vous serez redirigé vers Stripe, le partenaire de paiement de korí. Vos coordonnées bancaires sont
              saisies chez Stripe : korí n&apos;y a jamais accès.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Capability({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        ok ? "border-emerald-200 bg-white text-emerald-800" : "border-slate-200 bg-white text-slate-600",
      )}
    >
      {ok ? <Check className="size-3.5" /> : <Clock className="size-3.5" />}
      {label} {ok ? "actifs" : "en attente"}
    </span>
  );
}

function ReturnNotice({ status, onDismiss }: { status: StripeConnectStatus; onDismiss: () => void }) {
  const done = status === "ACTIVE";
  const pending = status === "IN_REVIEW" || status === "INCOMPLETE";
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4 text-sm shadow-sm">
      <div className="flex items-start gap-3">
        {pending ? (
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-slate-500" />
        ) : (
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        )}
        <p className="text-slate-700">
          {done
            ? "C'est fait : votre compte de paiement est actif."
            : pending
              ? "Bon retour ! Nous récupérons l'état de votre compte auprès de Stripe…"
              : "Bon retour ! Voici où en est votre compte de paiement."}
        </p>
      </div>
      <button onClick={onDismiss} className="text-xs text-slate-500 underline-offset-2 hover:underline">
        Fermer
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Étapes
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { title: "Vos informations", text: "Identité et compte bancaire, sur le formulaire sécurisé de Stripe." },
  { title: "Vérification", text: "Stripe vérifie vos informations, souvent en quelques minutes." },
  { title: "Paiements actifs", text: "Acomptes et ventes versés automatiquement sur votre compte." },
];

function currentStep(status: StripeConnectStatus): number {
  switch (status) {
    case "NOT_STARTED":
    case "INCOMPLETE":
      return 0;
    case "ACTION_REQUIRED":
    case "IN_REVIEW":
      return 1;
    case "ACTIVE":
      return 3;
  }
}

function Progress({ status }: { status: StripeConnectStatus }) {
  const current = currentStep(status);
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={step.title}
            className={cn(
              "flex gap-3 rounded-xl border p-4",
              active ? "border-[#34503F]/40 bg-white shadow-sm" : "border-slate-200 bg-white/60",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                done && "bg-emerald-600 text-white",
                active && "bg-[#34503F] text-white",
                !done && !active && "bg-slate-100 text-slate-500",
              )}
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-semibold", !done && !active && "text-slate-500")}>{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Contenu secondaire
// ─────────────────────────────────────────────────────────────────────────────

function WhatYouNeed() {
  const items = [
    { icon: IdCard, title: "Une pièce d'identité", text: "Permis de conduire, passeport ou carte d'identité." },
    { icon: Landmark, title: "Vos coordonnées bancaires", text: "Numéros d'institution, de transit et de compte." },
    { icon: Banknote, title: "Votre adresse et date de naissance", text: "Exigées par la réglementation financière." },
  ];
  return (
    <section className="rounded-2xl border bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-slate-900">Ce dont vous aurez besoin</h3>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Environ 5 minutes
        </span>
      </div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F0F4F1] text-[#34503F]">
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        Vous pouvez vous arrêter à tout moment : vos réponses sont conservées et vous reprendrez ici.
      </p>
    </section>
  );
}

function Unlocked({ account, locale }: { account: StripeConnectOverview; locale: string }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <Link
        href={`/${locale}/admin/salons/${account.salonId}`}
        className="group flex gap-3 rounded-2xl border bg-white p-5 transition hover:border-[#34503F]/40"
      >
        <CalendarCheck className="mt-0.5 size-5 shrink-0 text-[#34503F]" />
        <div>
          <p className="text-sm font-semibold">
            Acomptes à la réservation {account.depositEnabled ? "· activés" : "· désactivés"}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {account.depositEnabled
              ? "Vos clients versent un acompte en réservant : moins de rendez-vous manqués."
              : "Activez-les depuis la fiche de votre salon pour limiter les rendez-vous manqués."}
          </p>
        </div>
      </Link>
      <Link
        href={`/${locale}/admin/ma-boutique`}
        className="group flex gap-3 rounded-2xl border bg-white p-5 transition hover:border-[#34503F]/40"
      >
        <ShoppingBag className="mt-0.5 size-5 shrink-0 text-[#34503F]" />
        <div>
          <p className="text-sm font-semibold">Ma boutique</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Vos produits peuvent être achetés en ligne et retirés au salon.
          </p>
        </div>
      </Link>
    </section>
  );
}

function Faq() {
  return (
    <section className="rounded-2xl border bg-white px-6 py-2">
      <Accordion type="single" collapsible>
        <AccordionItem value="stripe">
          <AccordionTrigger className="text-sm">Pourquoi passer par Stripe ?</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Stripe est le partenaire de paiement de korí. Il encaisse les paiements de vos clients, vérifie votre
            identité comme l&apos;exige la réglementation, puis verse l&apos;argent sur votre compte bancaire. korí ne
            voit jamais vos coordonnées bancaires.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="virements">
          <AccordionTrigger className="text-sm">Quand est-ce que je reçois l&apos;argent ?</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Les virements vers votre compte bancaire sont automatiques, selon le calendrier de votre compte Stripe.
            Vous pouvez suivre votre solde et chaque virement depuis votre tableau de bord Stripe.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="banque">
          <AccordionTrigger className="text-sm">Comment changer de compte bancaire ?</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Depuis votre tableau de bord Stripe, rubrique des comptes de versement. Le bouton « Mon tableau de bord
            Stripe » apparaît sur cette page une fois votre formulaire envoyé.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sans">
          <AccordionTrigger className="text-sm">Et si je n&apos;active pas l&apos;encaissement en ligne ?</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Vos clients peuvent toujours réserver. Vous ne pourrez simplement pas demander d&apos;acompte ni vendre
            vos produits en ligne.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function CenteredSpinner({ label, children }: { label?: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
      {label && <p>{label}</p>}
      {children}
    </div>
  );
}
