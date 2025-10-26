/* eslint-disable @typescript-eslint/no-explicit-any */
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";

import StyledComponentsRegistry from "@/lib/AntdRegistry";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import Providers from "./components/Providers";

import { LocaleProvider } from "@/lib/LocaleProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import TanstackWrapperProvider from "@/lib/TanstackWrapperProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "🔗 korí - Services du quotidien, transferts et colis",
  description:
    "La plateforme qui vous connecte aux bonnes personnes pour des services du quotidien, des transferts d'argent sécurisés et le transport de colis. Simple, rapide et de confiance.",
  openGraph: {
    title: "korí - Services du quotidien, transferts et colis",
    description:
      "La plateforme qui vous connecte aux bonnes personnes pour des services du quotidien, des transferts d'argent sécurisés et le transport de colis. Simple, rapide et de confiance.",
    type: "website",
    url: "https://korí.app",
    images: [
      {
        url: "https://korí.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "korí - Services du quotidien, transferts et colis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@korí",
    title: "korí - Services du quotidien, transferts et colis",
    description:
      "La plateforme qui vous connecte aux bonnes personnes pour des services du quotidien, des transferts d'argent sécurisés et le transport de colis. Simple, rapide et de confiance.",
    images: "https://korí.app/twitter-image.jpg",
  },
};

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: any = await getServerSession(authOptions);
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <LocaleProvider initialLocale={locale}>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            style={{ margin: "0 auto" }}
          >
            <TanstackWrapperProvider>
              <StyledComponentsRegistry>
                <Providers session={session}>
                  <Analytics />
                  {children}
                  <Toaster />
                </Providers>
              </StyledComponentsRegistry>
            </TanstackWrapperProvider>
          </body>
        </LocaleProvider>
      </NextIntlClientProvider>
    </html>
  );
}
