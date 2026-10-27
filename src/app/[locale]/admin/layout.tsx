import type { Metadata } from "next";

/** Back-office : pages privées, exclues des moteurs de recherche. */
export const metadata: Metadata = {
  title: "Espace pro",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
