"use client";

import appStoreBadge from "@/assets/appstore.png";
import googlePlayBadge from "@/assets/googleplay.png";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SuccessModalProps {
  email: string;
  onClose: () => void;
}

export function SuccessModal({ email, onClose }: SuccessModalProps) {
  const [canClose, setCanClose] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);

  useEffect(() => {
    // Timer de 10 secondes
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center relative animate-in fade-in zoom-in duration-300">
        {/* Bouton de fermeture - Affiché après 10 secondes */}
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Félicitations ! 🎉
          </h2>
          <p className="text-gray-600 text-lg">
            Votre salon a été créé avec succès !
          </p>
          {!canClose && (
            <p className="text-sm text-gray-500 mt-2">
              Vous pourrez fermer cette fenêtre dans {timeRemaining} seconde
              {timeRemaining > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="mb-8">
          <p className="text-gray-700 text-base leading-relaxed">
            Pour commencer à gérer votre salon et recevoir des réservations,
            téléchargez l&apos;application mobile<span className="font-semibold text-primary"> korí.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <a
            href="https://apps.apple.com/app/kori/id6754260244"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <Image
              src={appStoreBadge}
              alt="Télécharger sur l'App Store"
              width={180}
              height={54}
              className="h-14 w-auto"
            />
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.laguidev.kori"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <Image
              src={googlePlayBadge}
              alt="Disponible sur Google Play"
              width={180}
              height={54}
              className="h-14 w-auto"
            />
          </a>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong className="text-blue-900">💡 Astuce :</strong> Une fois
            l&apos;application installée, connectez-vous avec votre email{" "}
            <span className="font-semibold">{email}</span> pour commencer à
            utiliser votre compte.
          </p>
        </div>
      </div>
    </div>
  );
}
