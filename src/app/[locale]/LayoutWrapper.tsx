"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Masquer la navbar pour la page landing-page
  const isLandingPage = pathname?.includes("/landing-page");

  if (isLandingPage) {
    return <>{children}</>;
  }

  return <Navbar>{children}</Navbar>;
}

