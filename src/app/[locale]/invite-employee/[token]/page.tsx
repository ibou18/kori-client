"use client";

import {
  useAcceptEmployeeInvitation,
  useGetEmployeeInvitationByToken,
} from "@/app/data/hooks";
import type { EmployeeInvitationPreview } from "@/app/data/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormattedPhoneInput } from "@/components/ui/FormattedPhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Liens publics (non exposés via next.config → on les fige ici).
const IOS_STORE_URL =
  "https://apps.apple.com/ca/app/kori-beauty/id6754260244?l=fr-CA";
const ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.laguidev.kori&pcampaignid=web_share";

/** Schéma natif de l'app mobile (cf. app.json : "scheme": "kori"). */
const deepLinkFor = (token: string) => `kori://invite-employee/${token}`;

type Device = "ios" | "android" | "other";

function detectDevice(): Device {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

function storeUrlFor(device: Device): string {
  if (device === "android") return ANDROID_STORE_URL;
  // iOS et desktop : on pousse l'App Store par défaut.
  return IOS_STORE_URL;
}

/**
 * Tente d'ouvrir l'app via deep link. Si la page reste visible (app non installée),
 * on considère qu'elle n'est pas là — le repli est géré par l'appelant.
 */
function tryOpenApp(token: string) {
  if (typeof window === "undefined") return;
  window.location.href = deepLinkFor(token);
}

export default function InviteEmployeePage() {
  const params = useParams();
  const token = (params?.token as string) ?? "";

  const {
    data: response,
    isLoading,
    error,
  } = useGetEmployeeInvitationByToken(token);

  const invitation: EmployeeInvitationPreview | undefined = response?.data;

  if (isLoading) {
    return (
      <CenteredShell>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          Chargement de l&apos;invitation…
        </p>
      </CenteredShell>
    );
  }

  if (error || !invitation) {
    return (
      <CenteredShell>
        <ErrorCard message="Cette invitation est introuvable ou a expiré." />
      </CenteredShell>
    );
  }

  if (!invitation.valid) {
    return (
      <CenteredShell>
        <ErrorCard
          message={
            invitation.blockedMessage ||
            "Cette invitation n'est plus valide (expirée, déjà utilisée ou révoquée). Contactez le salon pour en recevoir une nouvelle."
          }
        />
      </CenteredShell>
    );
  }

  return <InviteFlow token={token} invitation={invitation} />;
}

function InviteFlow({
  token,
  invitation,
}: {
  token: string;
  invitation: EmployeeInvitationPreview;
}) {
  const [device, setDevice] = useState<Device>("other");
  const [accepted, setAccepted] = useState(false);
  // "checking" : on tente d'ouvrir l'app installée ; "form" : on affiche le formulaire.
  const [phase, setPhase] = useState<"checking" | "form">("form");

  useEffect(() => {
    const d = detectDevice();
    setDevice(d);

    // Desktop : le deep link n'ouvrira rien → on va directement au formulaire.
    if (d === "other") {
      setPhase("form");
      return;
    }

    // Mobile : on tente d'ouvrir l'app sur l'écran d'invitation. Si la page passe
    // en arrière-plan, l'app s'est ouverte. Sinon (app non installée), on bascule
    // sur le formulaire après un court délai. Aucune invitation n'est consommée ici.
    setPhase("checking");
    let appOpened = false;
    const onVisibility = () => {
      if (document.hidden) appOpened = true;
    };
    document.addEventListener("visibilitychange", onVisibility);
    tryOpenApp(token);
    const timeout = setTimeout(() => {
      if (!appOpened) setPhase("form");
    }, 2000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(timeout);
    };
  }, [token]);

  const { mutate: accept, isPending } = useAcceptEmployeeInvitation(token);

  // Champs (préremplis depuis l'invitation).
  const [firstName, setFirstName] = useState(invitation.firstName ?? "");
  const [lastName, setLastName] = useState(invitation.lastName ?? "");
  const [phone, setPhone] = useState(invitation.prefillPhone ?? "");
  const [indicatif, setIndicatif] = useState(
    invitation.prefillIndicatif ?? "+1"
  );
  const [password, setPassword] = useState("");

  const needsProfile = invitation.requiresProfileForm;
  const needsPassword = invitation.requiresPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prénom et nom sont toujours obligatoires avant d'accepter.
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Veuillez renseigner votre prénom et votre nom.");
      return;
    }
    if (needsProfile && !phone.trim()) {
      toast.error("Veuillez renseigner votre numéro de téléphone.");
      return;
    }
    if (needsPassword && password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    accept(
      {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        indicatif: indicatif || undefined,
        password: needsPassword ? password : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Invitation acceptée ! Téléchargez l'application korí.");
          setAccepted(true);
        },
      }
    );
  };

  if (accepted) {
    return (
      <CenteredShell>
        <DownloadStep token={token} device={device} />
      </CenteredShell>
    );
  }

  // Tentative d'ouverture de l'app installée (écran d'invitation).
  if (phase === "checking") {
    return (
      <CenteredShell>
        <div className="w-full max-w-sm text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h1 className="mt-4 text-lg font-semibold text-foreground">
            Ouverture de l&apos;application korí…
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Si l&apos;application est installée, elle s&apos;ouvre sur
            l&apos;écran d&apos;invitation.
          </p>
          <Button
            type="button"
            className="mt-6 w-full"
            onClick={() => tryOpenApp(token)}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Ouvrir dans l&apos;application korí
          </Button>
          <button
            type="button"
            onClick={() => setPhase("form")}
            className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Je n&apos;ai pas l&apos;application — accepter ici
          </button>
        </div>
      </CenteredShell>
    );
  }

  return (
    <CenteredShell>
      <div className="w-full max-w-md space-y-5">
        {/* En-tête invitation */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h1 className="text-xl font-bold text-foreground">
              Rejoindre {invitation.salonName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Vous avez été invité(e) à rejoindre l&apos;équipe avec
              l&apos;adresse{" "}
              <span className="font-medium text-foreground">
                {invitation.email}
              </span>
              .
            </p>
          </CardContent>
        </Card>

        {/* Si l'app est déjà installée */}
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm font-medium text-foreground">
              Vous avez déjà l&apos;application korí ?
            </p>
            <Button
              type="button"
              className="w-full"
              onClick={() => tryOpenApp(token)}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Ouvrir dans l&apos;application korí
            </Button>
          </CardContent>
        </Card>

        {/* Sinon : formulaire d'acceptation */}
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm font-medium text-foreground">
              Vous n&apos;avez pas encore l&apos;application ? Acceptez votre
              invitation ici, puis téléchargez korí.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prénom et nom : toujours obligatoires ; empilés sur mobile. */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              {needsProfile && (
                <FormattedPhoneInput
                  label="Téléphone"
                  value={phone}
                  countryCode={indicatif}
                  onPhoneChange={setPhone}
                  onCountryCodeChange={(dialCode) => setIndicatif(dialCode)}
                  required
                />
              )}

              {needsPassword && (
                <div className="space-y-1.5">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    autoComplete="new-password"
                  />
                </div>
              )}

              {!needsProfile && !needsPassword && (
                <p className="text-sm text-muted-foreground">
                  Votre compte korí existant sera rattaché à ce salon.
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Accepter l&apos;invitation
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </CenteredShell>
  );
}

/**
 * Étape post-acceptation : on force le téléchargement de l'app.
 * On tente d'abord d'ouvrir l'app (au cas où elle serait installée),
 * puis on redirige automatiquement vers le store après 10 s.
 */
function DownloadStep({ token, device }: { token: string; device: Device }) {
  const [countdown, setCountdown] = useState(10);
  const redirectedRef = useRef(false);
  const storeUrl = storeUrlFor(device);

  useEffect(() => {
    // Si l'app s'ouvre, l'onglet passe en arrière-plan → on annule le repli store.
    const onVisibility = () => {
      if (document.hidden) redirectedRef.current = true;
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Tentative d'ouverture immédiate de l'app (mobile uniquement).
    if (device !== "other") {
      tryOpenApp(token);
    }

    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    const timeout = setTimeout(() => {
      if (!redirectedRef.current) {
        window.location.href = storeUrl;
      }
    }, 10000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [token, device, storeUrl]);

  return (
    <div className="w-full max-w-md text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <h1 className="text-xl font-bold text-foreground">
        Invitation acceptée 🎉
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Téléchargez l&apos;application korí pour accéder à votre agenda et à vos
        réservations. Redirection automatique dans{" "}
        <span className="font-semibold text-foreground">{countdown}s</span>…
      </p>

      <div className="mt-6 flex flex-col items-center gap-3">
        <a
          href={IOS_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105"
        >
          <Image
            src="/assets/apple.png"
            alt="Télécharger sur l'App Store"
            width={180}
            height={54}
            className="h-12 w-auto object-contain"
          />
        </a>
        <a
          href={ANDROID_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105"
        >
          <Image
            src="/assets/android.png"
            alt="Disponible sur Google Play"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </a>
      </div>

      <button
        type="button"
        onClick={() => tryOpenApp(token)}
        className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        J&apos;ai déjà l&apos;app — ouvrir korí
      </button>
    </div>
  );
}

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      {children}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="w-full max-w-md border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
          <div>
            <h2 className="mb-1 text-lg font-semibold text-red-900">
              Invitation indisponible
            </h2>
            <p className="text-sm text-red-800">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
