import HomePageClient from "@/app/components/HomePageClient";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Réservation de services de beauté afro | korí",
  description:
    "Réservez vos prestations de beauté afro en toute simplicité. Trouvez les meilleurs coiffeurs, barbiers et salons spécialisés près de chez vous. Simple, rapide et de confiance.",
  openGraph: {
    title: "Réservation de services de beauté afro | korí",
    description:
      "Réservez vos prestations de beauté afro en toute simplicité. Trouvez les meilleurs coiffeurs, barbiers et salons spécialisés près de chez vous. Simple, rapide et de confiance.",
    images: [
      {
        url: `${siteConfig.url}/og-images/home.jpg`,
        width: 1200,
        height: 630,
        alt: "korí - Réservation de services de beauté afro",
      },
    ],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
