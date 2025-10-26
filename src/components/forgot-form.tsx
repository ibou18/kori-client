/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { message, Spin } from "antd";

import logo from "@/assets/logo-black.png";
import Image from "next/image";
import { useForgotPassword } from "@/app/data/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ForgotForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const route = useRouter();
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
          "Un email de réinitialisation a été envoyé à votre adresse email" +
            ": " +
            email
        );
        route.push("/auth/signin");
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Mot de passe Oublié </h1>
                <p className="text-balance text-muted-foreground">
                  Vous avez oubliez votre mot de passe? Pas de soucis, entrez
                  votre adresse email et nous vous enverrons un lien pour
                  réinitialiser votre mot de passe.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Spin spinning={loading}>
                <Button type="submit" className="w-full">
                  Continuer
                </Button>
              </Spin>
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
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  );
}
