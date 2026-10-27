/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AuthCard } from "@/app/components/auth/AuthCard";
import { AuthField, PasswordField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { useResetPassword } from "@/app/data/hooks";
import { IUser } from "@/app/interface";
import useUserStore from "@/app/store/useUserStore";
import { Button } from "@/components/ui/button";
import { message } from "antd";
import { AlertCircle, ArrowRight, Loader2, Mail } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetForm({
  user,
  token,
}: {
  user: IUser;
  token?: string;
}) {
  const clearUser = useUserStore((state) => state.clearUser);

  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { mutate: resetPassword } = useResetPassword();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Utiliser le token passé en prop ou celui de l'utilisateur
    const resetToken = token || user.token;

    if (!resetToken) {
      setError("Token de réinitialisation manquant");
      return;
    }

    setLoading(true);

    await resetPassword(
      {
        token: resetToken,
        password: password,
      },
      {
        onSuccess: async () => {
          setLoading(false);
          const cookies = document.cookie.split(";");
          cookies.forEach((cookie) => {
            document.cookie = cookie
              .replace(/^ +/, "")
              .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
          });

          // Vider le localStorage
          localStorage.clear();

          // Vider le state global
          clearUser();

          // Se déconnecter avec next-auth
          await signOut({
            callbackUrl: "/",
            redirect: true,
          });
          message.success("Mot de passe réinitialisé avec succès");
          router.push("/auth/signin");
        },
        onError: () => {
          setLoading(false);
          setError("Erreur lors de la réinitialisation du mot de passe");
        },
      }
    );
  };

  useEffect(() => {
    if (session) {
      window.location.replace("/admin/dashboard");
    }
  }, [session]);

  const displayName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <AuthShell>
      <AuthCard
        eyebrow="Nouveau mot de passe"
        title={displayName ? `Bonjour ${displayName}.` : "Choisissez un nouveau mot de passe."}
        description="Renseignez votre nouveau mot de passe. Vous serez ensuite invité à vous reconnecter."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthField
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            value={user?.email ?? ""}
            disabled
            readOnly
          />
          <PasswordField
            id="password"
            label="Nouveau mot de passe"
            autoComplete="new-password"
            placeholder="Minimum 6 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full text-base shadow-[0_12px_30px_-10px_rgba(83,116,93,0.7)] transition-transform hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enregistrement…
              </>
            ) : (
              <>
                Enregistrer le mot de passe
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Créer mon salon gratuitement
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
