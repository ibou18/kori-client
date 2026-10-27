"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo-white.png";
import { StoreBadges } from "./StoreBadges";

const columns = [
  {
    title: "korí",
    links: [
      { label: "À propos", href: "/about" },
      { label: "Support", href: "/support" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Professionnels",
    links: [
      { label: "Créer mon salon", href: "/inscription" },
      { label: "Se connecter", href: "/auth/signin" },
      { label: "Conditions pros", href: "/terms/cgu-pro" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Conditions clients", href: "/terms/cgu-client" },
      { label: "Confidentialité", href: "/terms/privacy" },
      { label: "CGV", href: "/terms/cgv" },
    ],
  },
];

/** Pied de page de la landing. */
export function LandingFooter() {
  return (
    <footer className="bg-[#1c1f1d] py-16 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Image src={logo} alt="korí" className="h-9 w-auto" width={400} height={160} />
            <p className="mt-4 max-w-xs text-sm text-white/60">
              La plateforme de réservation beauté qui connecte les clients aux
              meilleurs coiffeurs, barbiers et spécialistes près de chez eux.
            </p>
            <StoreBadges className="mt-6" size="sm" />
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} korí. Tous droits réservés.</p>
          <p>Fait avec soin au Canada.</p>
        </div>
      </div>
    </footer>
  );
}
