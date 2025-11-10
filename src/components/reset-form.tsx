/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { message, Spin } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import logo from "@/assets/logo-black.png";
import Image from "next/image";

import { useResetPassword } from "@/app/data/hooks";
import { IUser } from "@/app/interface";
import useUserStore from "@/app/store/useUserStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  console.log("user", user);
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

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  {user?.firstName + " " + user?.lastName}
                </h1>
                <p className="text-balance text-muted-foreground">
                  Merci de renseigner votre nouveau mot de passe.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={user?.email}
                  disabled
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Nouveau mot de Passe : </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Spin spinning={loading}>
                <Button type="submit" className="w-full">
                  Save
                </Button>
              </Spin>
              {error && <p className="text-red-500">{error}</p>}

              <div className="text-center text-sm">
                Pas de compte?{" "}
                <Link
                  href="/auth/register"
                  className="underline underline-offset-4"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src={logo}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
