/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AuthCard } from "@/app/components/auth/AuthCard";
import { AuthField } from "@/app/components/auth/AuthField";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { useForgotPassword } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { message } from "antd";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ForgotForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { mutate: forgotPassword } = useForgotPassword();
  const { data: session }: any = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await forgotPassword(email, {
      onSuccess: () => {
        setLoading(false);
        message.success(
          "Un email de réinitialisation a été envoyé à votre adresse : " + email
        );
        router.push("/auth/signin");
      },
      onError: () => {
        setLoading(false);
        message.error("Erreur lors de l'envoi de l'email de réinitialisation");
      },
    });
  };

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      window.location.replace("/admin/dashboard");
    }
  }, [session]);

  return (
    <AuthShell>
      <AuthCard
        eyebrow="Mot de passe oublié"
        title="On vous renvoie un lien."
        description="Entrez l'adresse email de votre compte. Vous recevrez un lien pour choisir un nouveau mot de passe."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
            disabled={loading}
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full text-base shadow-[0_12px_30px_-10px_rgba(83,116,93,0.7)] transition-transform hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Envoi…
              </>
            ) : (
              <>
                Envoyer le lien
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <Link
          href="/auth/signin"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="size-4" />
          Retour à la connexion
        </Link>
      </AuthCard>
    </AuthShell>
  );
}
