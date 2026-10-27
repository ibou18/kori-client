/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGetUsersbyToken } from "@/app/data/hooks";
import ResetForm from "@/components/reset-form";
import { AuthCard } from "@/app/components/auth/AuthCard";
import { AuthShell } from "@/app/components/auth/AuthShell";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token: any = searchParams.get("token");

  const { data: userByToken }: any = useGetUsersbyToken(token);

  if (!token) {
    return (
      <AuthShell>
        <AuthCard
          eyebrow="Lien invalide"
          title="Ce lien n'est plus valide."
          description="Demandez un nouveau lien de réinitialisation depuis la page de connexion."
        >
          <Link
            href="/auth/forgot-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Recevoir un nouveau lien
          </Link>
        </AuthCard>
      </AuthShell>
    );
  }

  return <ResetForm user={userByToken} token={token} />;
}
