"use client";

import { MetaPixel } from "@/components/MetaPixel";
import { TikTokPixel } from "@/components/TikTokPixel";
import { ProviderRegisterForm } from "./components/ProviderRegisterForm";

export default function LandingPage() {
  return (
    <>
      <TikTokPixel />
      <MetaPixel />
      <ProviderRegisterForm />
    </>
  );
}
