"use client";

import { useVerifyEmail } from "@/app/data/hooksHop";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { CheckCircleIcon, XCircleIcon, Hourglass } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const {
    data: userVerified,
    isError,
    isLoading,
  } = useVerifyEmail(token as string);

  useEffect(() => {
    if (userVerified) {
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } else if (isError) {
      setTimeout(() => {
        window.location.href = "/auth/register";
      }, 3000);
    }
  }, [userVerified, isError, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Vérification en cours...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Vérification de l&apos;e-mail
        </h1>

        {userVerified && (
          <div className="flex items-center justify-center text-green-600 mb-4">
            <CheckCircleIcon className="h-6 w-6 mr-2" />
            <p className="text-lg font-semibold">
              Votre adresse e-mail a été vérifiée avec succès !
            </p>
          </div>
        )}

        {!userVerified && !isError && (
          <div className="flex items-center justify-center text-yellow-600 mb-4">
            <Hourglass className="h-6 w-6 mr-2 animate-pulse" />
            <p className="text-lg font-semibold">Vérification en cours...</p>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center text-red-600 mb-4">
            <XCircleIcon className="h-6 w-6 mr-2" />
            <p className="text-lg font-semibold">
              Erreur lors de la vérification. Veuillez réessayer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
