import HomePageClient from "@/app/components/HomePageClient";
import { LANDING_FAQS } from "@/app/components/landing/faqData";
import { JsonLd } from "@/components/JsonLd";
import {
  absoluteUrl,
  buildOpenGraph,
  buildTwitter,
  siteConfig,
} from "@/config/site";
import { Metadata } from "next";

const title = "Réservez coiffure, tresses, barbier et soins en 2 minutes";
const description =
  "Trouvez les meilleurs coiffeurs, barbiers et spécialistes beauté près de chez vous et réservez en ligne 24 h / 24. Professionnels : créez votre salon gratuitement, sans abonnement.";

export const metadata: Metadata = {
  title: { absolute: `korí · ${title}` },
  description,
  // Le contenu de la landing n'existe qu'en français : /en pointe vers /fr.
  alternates: { canonical: "/fr" },
  openGraph: buildOpenGraph({
    title: `korí · ${title}`,
    description,
    url: absoluteUrl("/fr"),
  }),
  twitter: buildTwitter({ title: `korí · ${title}`, description }),
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: absoluteUrl("/icon.png"),
    email: siteConfig.email,
    areaServed: { "@type": "Country", name: "Canada" },
    sameAs: [siteConfig.appStoreUrl, siteConfig.googlePlayUrl],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "fr-CA",
    publisher: { "@id": `${siteConfig.url}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "korí",
    operatingSystem: "iOS, Android",
    applicationCategory: "LifestyleApplication",
    description,
    downloadUrl: [siteConfig.appStoreUrl, siteConfig.googlePlayUrl],
    offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
    publisher: { "@id": `${siteConfig.url}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: LANDING_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <HomePageClient />
    </>
  );
}
