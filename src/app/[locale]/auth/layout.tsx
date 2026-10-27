import type { Metadata } from "next";

/** Authentification : pages privées, exclues des moteurs de recherche. */
export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
