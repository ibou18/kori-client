/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useState } from "react";

import logo from "@/assets/logo-white.png";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("laguidev@gmail.com");
  const [password, setPassword] = useState("test1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Authentification réussie
        setAuthSuccess(true);

        // Attendre un court instant pour montrer l'animation de succès
        setTimeout(async () => {
          setIsRedirecting(true);

          try {
            // Attendre la résolution complète de la promesse
            const response = await fetch("/api/auth/session");
            const sessionData = await response.json();

            console.log("session", sessionData);

            if (sessionData?.user?.role === "ADMIN") {
              window.location.href = "/admin/dashboard";
            } else if (sessionData?.user?.role === "USER") {
              window.location.href = "/admin/trips";
            } else if (sessionData?.user?.role === "TRAVELER") {
              window.location.href = "/admin/deliveries";
            } else {
              // Fallback au cas où le rôle n'est pas défini
              window.location.href = "/admin/dashboard";
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération de la session:",
              error
            );
            // Redirection par défaut en cas d'erreur
            window.location.href = "/admin/dashboard";
          }
        }, 800);
      }
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="relative hidden bg-gradient-to-br from-teal-400 to-slate-600 md:block">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <Image
                  src={logo}
                  alt="Kori"
                  width={360}
                  height={150}
                  className="mb-8"
                />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-4 text-2xl font-bold"
              >
                La plateforme qui simplifie vos rendez-vous beauté
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-white/80"
              >
                Réservez facilement vos prestations de beauté et bien-être ou
                proposez vos services à notre communauté.
              </motion.p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold mb-2">Bienvenue</h1>
                <p className="text-balance text-muted-foreground">
                  Connectez-vous à votre compte pour continuer
                </p>
                <div className="md:hidden mt-4 mb-2">
                  <Image src={logo} alt="Kori" width={100} height={100} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    disabled={loading || isRedirecting}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mot de passe
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto text-sm text-blue-600 underline-offset-2 hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                    disabled={loading || isRedirecting}
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={loading || isRedirecting}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connexion...
                  </span>
                ) : authSuccess ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Connexion réussie
                  </span>
                ) : (
                  "Se connecter"
                )}
              </Button>

              <div className="text-center text-sm">
                Pas encore de compte ?{" "}
                <Link
                  href="/auth/register"
                  className="text-blue-600 underline underline-offset-4 hover:text-blue-800"
                >
                  S&apos;inscrire
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        En cliquant sur continuer, vous acceptez nos{" "}
        <Link href="/terms/cgv">Conditions Générales de Vente</Link> et notre{" "}
        <Link href="/terms/privacy">Politique de confidentialité</Link>
      </div>

      {/* Overlay de redirection */}
      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center space-y-6 max-w-md text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="rounded-full bg-blue-100 p-4"
              >
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  Préparation de votre espace
                </h2>
                <p className="text-muted-foreground">
                  Nous vous redirigeons vers votre tableau de bord...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
