"use client";

import Image from "next/image";
import Link from "next/link";

const APP_STORE_URL = "https://apps.apple.com/app/kori/id6754260244";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.laguidev.kori";

/**
 * Pied de page du mini-site (maquette) : « Propulsé par korí », invitation aux
 * pros à créer leur page, badges stores discrets.
 */
export function SalonFooter({ locale, isEn }: { locale: string; isEn: boolean }) {
  return (
    <footer className="mt-auto flex flex-col items-center gap-1 border-t border-site-border bg-site-surface px-5 py-[18px] text-center text-[13px] text-site-muted">
      <span>
        {isEn ? "Powered by" : "Propulsé par"}{" "}
        <strong className="font-site-display text-[15px] text-site-fg">korí</strong>
      </span>
      <Link
        href={`/${locale}/inscription`}
        className="flex min-h-11 items-center font-medium text-site-fg hover:underline"
      >
        {isEn ? "Create your page with korí" : "Créez votre page avec korí"}
      </Link>
      <div className="mt-1 flex items-center gap-2 opacity-80">
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <Image src="/assets/apple.png" alt="Download on the App Store" width={180} height={54} className="h-8 w-auto object-contain" />
        </a>
        <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <Image src="/assets/android.png" alt="Get it on Google Play" width={200} height={60} className="h-8 w-auto object-contain" />
        </a>
      </div>
    </footer>
  );
}
