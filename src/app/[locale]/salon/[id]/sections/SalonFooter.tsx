"use client";

import { Smartphone } from "lucide-react";
import Image from "next/image";
import { useSalonTheme } from "../theme/SalonThemeProvider";

const APP_STORE_URL = "https://apps.apple.com/app/kori/id6754260244";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.laguidev.kori";

/**
 * Pied de page du mini-site : mention korí discrète + ouverture dans l'app.
 * Remplace l'ancien gros bloc « Téléchargez l'application ».
 */
export function SalonFooter({
  salonId,
  isEn,
}: {
  salonId: string;
  isEn: boolean;
}) {
  const theme = useSalonTheme();

  const handleOpenApp = () => {
    const deepLink = `kori://salon/salon-detail?id=${salonId}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const storeUrl = isIOS ? APP_STORE_URL : GOOGLE_PLAY_URL;
    const start = Date.now();
    const timeoutId = window.setTimeout(() => {
      if (Date.now() - start < 2000) window.location.href = storeUrl;
    }, 1500);
    window.location.href = deepLink;
    window.setTimeout(() => window.clearTimeout(timeoutId), 3000);
  };

  return (
    <footer
      className="-mx-4 mt-6 border-t border-black/[0.06] px-4 py-8 lg:-mx-8 lg:px-8"
      style={{ background: `${theme.primaryColor}14` }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>
          {isEn ? "Secure booking powered by" : "Réservation sécurisée propulsée par"}{" "}
          <b className="text-slate-800">korí</b>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleOpenApp}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-white sm:self-auto"
            style={{ borderColor: `${theme.primaryColor}59`, color: theme.primaryColor }}
          >
            <Smartphone className="size-4" />
            {isEn ? "Open in the app" : "Ouvrir dans l'app"}
          </button>
          {/* Les deux badges restent toujours côte à côte, sur une seule ligne */}
          <div className="flex flex-nowrap items-center gap-2">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="shrink-0 transition-transform hover:scale-105">
              <Image src="/assets/apple.png" alt="Download on the App Store" width={180} height={54} className="h-9 w-auto object-contain" />
            </a>
            <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" className="shrink-0 transition-transform hover:scale-105">
              <Image src="/assets/android.png" alt="Get it on Google Play" width={200} height={60} className="h-9 w-auto object-contain" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
