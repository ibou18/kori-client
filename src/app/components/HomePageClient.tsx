"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ClientBenefits } from "./landing/ClientBenefits";
import { Faq } from "./landing/Faq";
import { FinalCta } from "./landing/FinalCta";
import { HowItWorks } from "./landing/HowItWorks";
import { LandingFooter } from "./landing/LandingFooter";
import { LandingHero } from "./landing/LandingHero";
import { ProFreeSection } from "./landing/ProFreeSection";
import { ServicesMarquee } from "./landing/ServicesMarquee";
import { Testimonials } from "./landing/Testimonials";

/**
 * Landing page korí : réservation côté clients, inscription gratuite côté pros.
 * Les marges négatives annulent le padding du <main> de la Navbar pour un rendu pleine largeur.
 */
export default function HomePageClient(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/admin/dashboard");
    }
  }, [router, session?.user]);

  return (
    <div className="-mx-4 -mt-4 -mb-12 font-[family-name:var(--font-geist-sans)] lg:-mx-8">
      <LandingHero />
      <ServicesMarquee />
      <HowItWorks />
      <ProFreeSection />
      <ClientBenefits />
      <Testimonials />
      <Faq />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
