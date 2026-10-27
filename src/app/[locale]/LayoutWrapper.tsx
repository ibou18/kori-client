"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import SalonPublicLayout from "./SalonPublicLayout";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Masquer la navbar pour la page landing-page et inscription
  const isLandingPage = pathname?.includes("/landing-page");
  const isInscriptionPage = pathname?.includes("/inscription");
  // Pages d'authentification : gabarit plein écran dédié (AuthShell)
  const isAuthPage = !!pathname && /^\/(fr|en)\/auth\//.test(pathname);

  // Page salon partagée : barre dédiée (client / invité) ou navbar pro si OWNER/EMPLOYEE/ADMIN
  const isSalonPublicPath =
    !!pathname && /^\/(fr|en)\/salon\/[^/]+/.test(pathname);

  if (isLandingPage || isInscriptionPage || isAuthPage) {
    return <>{children}</>;
  }

  if (isSalonPublicPath) {
    return <SalonPublicLayout>{children}</SalonPublicLayout>;
  }

  return <Navbar>{children}</Navbar>;
}

