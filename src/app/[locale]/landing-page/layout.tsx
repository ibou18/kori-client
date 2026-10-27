import type { Metadata } from "next";

/** Landing d'acquisition (publicités), doublon de /inscription : pages privées, exclues des moteurs de recherche. */
export const metadata: Metadata = {
  title: "Inscription rapide",
  robots: { index: false, follow: false },
};

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
