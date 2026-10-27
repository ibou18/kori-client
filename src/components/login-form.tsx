"use client";

import { AuthCard } from "@/app/components/auth/AuthCard";
import { AuthField, PasswordField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { getPostAuthRedirectPath } from "@/utils/authRedirects";
import {
  getLoginErrorMessage,
  validateLoginCredentials,
} from "@/utils/loginValidation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Loader2,
  Mail,
  Sparkles,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const isDev = process.env.NODE_ENV === "development";

export function LoginForm() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  // Pré-remplissage uniquement en développement.
  const [email, setEmail] = useState(isDev ? "support@koribeauty.com" : "");
  const [password, setPassword] = useState(isDev ? "test1234" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const busy = loading || isRedirecting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateLoginCredentials({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(getLoginErrorMessage(result.error));
        setLoading(false);
      } else {
        setAuthSuccess(true);

        // Court délai pour montrer l'état de succès avant la redirection.
        setTimeout(async () => {
          setIsRedirecting(true);
          try {
            const response = await fetch("/api/auth/session");
            const sessionData = await response.json();
            const role = sessionData?.user?.role as string | undefined;
            window.location.href = getPostAuthRedirectPath(locale, role);
          } catch (err) {
            console.error("Erreur lors de la récupération de la session:", err);
            window.location.href = getPostAuthRedirectPath(locale, undefined);
          }
        }, 800);
      }
    } catch (err) {
      setError(getLoginErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        <>
          En vous connectant, vous acceptez nos{" "}
          <Link href="/terms/cgv">Conditions Générales de Vente</Link> et notre{" "}
          <Link href="/terms/privacy">Politique de confidentialité</Link>.
        </>
      }
    >
      <AuthCard
        eyebrow="Connexion"
        title="Content de vous revoir."
        description="Connectez-vous pour gérer votre salon, vos prestations et vos rendez-vous."
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <AuthField
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={busy}
          />

          <PasswordField
            id="password"
            label="Mot de passe"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={busy}
            labelAction={
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            }
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
                role="alert"
              >
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full text-base shadow-[0_12px_30px_-10px_rgba(83,116,93,0.7)] transition-transform hover:-translate-y-0.5"
            disabled={busy}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connexion…
              </>
            ) : authSuccess ? (
              <>
                <CheckCircle className="size-4" />
                Connexion réussie
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <Link
            href="/inscription"
            className="group flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 transition-colors hover:border-primary/30 hover:bg-primary/10"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Sparkles className="size-4" />
            </span>
            <span className="flex-1 text-sm">
              <span className="block font-semibold text-gray-900">
                Pas encore sur korí ?
              </span>
              <span className="text-gray-600">
                Créez votre salon gratuitement, en 2 minutes.
              </span>
            </span>
            <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </AuthCard>

      {/* Overlay de redirection */}
      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F7F1E8]/90 backdrop-blur-sm"
          >
            <div className="flex max-w-md flex-col items-center space-y-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="rounded-full bg-primary/10 p-4"
              >
                <Loader2 className="size-12 animate-spin text-primary" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Préparation de votre espace
                </h2>
                <p className="text-gray-600">
                  Nous vous redirigeons vers votre tableau de bord…
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
