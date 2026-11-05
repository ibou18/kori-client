/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { LucideIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export interface HeroHighlight {
  label: string;
  value: string | number;
}

export interface HeroAction {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

interface DashboardHeroProps {
  /** Ligne sous la salutation (ex. nom du salon, « Vue d'ensemble de la plateforme »). */
  subtitle: string;
  highlights?: HeroHighlight[];
  actions?: HeroAction[];
}

const greeting = () => {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour";
};

/** Bandeau d'accueil commun aux tableaux de bord pro et admin. */
export function DashboardHero({
  subtitle,
  highlights = [],
  actions = [],
}: DashboardHeroProps) {
  const { data: session }: any = useSession();
  const firstName = session?.user?.firstName;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#53745D] to-[#34503F] p-6 text-white shadow-sm sm:p-8">
      {/* Halos décoratifs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-[#A3BDA8]/20 blur-2xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-white/75">{subtitle}</p>

          {actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  {...(action.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium ring-1 ring-inset ring-white/20 transition-colors hover:bg-white hover:text-[#34503F]"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {highlights.length > 0 && (
          <dl className="flex shrink-0 flex-wrap gap-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="min-w-[8.5rem] rounded-xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15"
              >
                <dt className="text-xs text-white/70">{item.label}</dt>
                <dd className="mt-0.5 text-2xl font-bold tabular-nums">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
