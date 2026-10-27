import { absoluteUrl, buildOpenGraph, buildTwitter } from "@/config/site";
import type { Metadata } from "next";

const title = "Inscription professionnelle gratuite";
const description =
  "Coiffeuse, barbier, manucure, esthéticienne : créez votre salon sur korí en 2 minutes. 0 $ d'abonnement, sans engagement, sans carte bancaire. Agenda, rappels SMS et acomptes inclus.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/fr/inscription" },
  openGraph: buildOpenGraph({
    title: `${title} | korí`,
    description,
    url: absoluteUrl("/fr/inscription"),
  }),
  twitter: buildTwitter({ title: `${title} | korí`, description }),
};

export default function InscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
