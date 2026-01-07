"use client";

import { Check, Download, Smartphone } from "lucide-react";

interface SuccessModalProps {
  email: string;
}

export function SuccessModal({ email }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center relative animate-in fade-in zoom-in duration-300">
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
        </div>

        <div className="mb-8">
          <p className="text-gray-700 text-base leading-relaxed">
            Pour commencer à gérer votre salon et recevoir des réservations,
            téléchargez l&apos;application mobile korí.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <a
            href="https://apps.apple.com/app/kori/id6754260244"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-black text-white rounded-xl px-6 py-4 hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
          >
            <Smartphone className="w-6 h-6" />
            <div className="text-left">
              <div className="text-xs opacity-90">Télécharger sur</div>
              <div className="font-bold text-lg">App Store</div>
            </div>
            <Download className="w-5 h-5 ml-auto" />
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.laguidev.kori"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#0F9D58] text-white rounded-xl px-6 py-4 hover:bg-[#0d8a4c] transition-all transform hover:scale-105 shadow-lg"
          >
            <Smartphone className="w-6 h-6" />
            <div className="text-left">
              <div className="text-xs opacity-90">Télécharger sur</div>
              <div className="font-bold text-lg">Google Play</div>
            </div>
            <Download className="w-5 h-5 ml-auto" />
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

