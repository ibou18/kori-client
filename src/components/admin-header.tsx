/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import LogoutButton from "@/app/components/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocaleSwitch } from "@/components/locale-switch";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocaleContext } from "@/lib/LocaleProvider";
import { cn } from "@/lib/utils";
import { ADMIN, EMPLOYEE, OWNER } from "@/shared/constantes";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  UserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Titre affiché dans le fil d'Ariane, par préfixe de chemin (sans la locale).
 * L'ordre compte : le premier préfixe qui correspond gagne.
 */
const PAGE_TITLES: [prefix: string, title: string][] = [
  ["/admin/dashboard", "Tableau de bord"],
  ["/admin/mon-site", "Mon mini-site"],
  ["/admin/calendrier", "Calendrier"],
  ["/admin/bookings", "Réservations"],
  ["/admin/mes-services", "Mes services"],
  ["/admin/ma-boutique", "Ma boutique"],
  ["/admin/payments", "Paiements"],
  ["/admin/users", "Utilisateurs"],
  ["/admin/prospect", "Prospects"],
  ["/admin/salons", "Salons"],
  ["/admin/crm", "Relances CRM"],
  ["/admin/services", "Services"],
  ["/admin/stats", "Statistiques"],
  ["/admin/config", "Configuration"],
  ["/admin/maps", "Cartes"],
  ["/admin/shortlinks", "Liens courts"],
  ["/admin/account", "Mon compte"],
  ["/admin/support", "Support"],
];

const ROLE_LABELS: Record<string, string> = {
  [ADMIN]: "Administrateur",
  [OWNER]: "Propriétaire",
  [EMPLOYEE]: "Employé",
};

const stripLocale = (pathname: string) =>
  pathname.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";

function resolveTitle(path: string, role?: string, salonId?: string) {
  if (role === OWNER && salonId && path.startsWith(`/admin/salons/${salonId}`)) {
    return "Mon salon";
  }
  return PAGE_TITLES.find(([prefix]) => path.startsWith(prefix))?.[1] ?? null;
}

/**
 * En-tête unique du back-office, partagé par les rôles ADMIN, OWNER et EMPLOYEE.
 * Seuls le libellé de l'espace et les raccourcis varient selon le rôle.
 */
export function AdminHeader() {
  const { data: session }: any = useSession();
  const { locale } = useLocaleContext();
  const pathname = usePathname() ?? "";

  const user = session?.user;
  const role = user?.role as string | undefined;
  const salonId = user?.salonId as string | undefined;

  const path = stripLocale(pathname);
  const title = resolveTitle(path, role, salonId);
  const shellLabel = role === ADMIN ? "Administration" : "Espace professionnel";
  const homeUrl = role === EMPLOYEE ? "/admin/calendrier" : "/admin/dashboard";

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials =
    [user?.firstName, user?.lastName]
      .map((part: string | undefined) => part?.trim()?.[0] ?? "")
      .join("")
      .toUpperCase() || "K";

  const today = new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/70 bg-white/80 px-3 backdrop-blur sm:px-5 md:rounded-t-xl">
      <SidebarTrigger className="-ml-1 text-slate-500 hover:text-[#3a5a47]" />
      <Separator orientation="vertical" className="h-5" />

      {/* Fil d'Ariane : espace › page courante */}
      <nav
        aria-label="Fil d'Ariane"
        className="flex min-w-0 flex-1 items-center gap-1.5 text-sm"
      >
        <Link
          href={homeUrl}
          className={cn(
            "shrink-0 text-slate-500 transition-colors hover:text-[#3a5a47]",
            title && "hidden sm:inline",
          )}
        >
          {shellLabel}
        </Link>
        {title && (
          <>
            <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-slate-300 sm:block" />
            <span className="truncate font-semibold text-slate-900">
              {title}
            </span>
          </>
        )}
      </nav>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-[#F0F4F1] px-3 py-1.5 text-xs font-medium capitalize text-[#3a5a47] lg:inline-flex">
          <CalendarDays className="h-3.5 w-3.5" />
          {today}
        </span>

        {role === OWNER && salonId && (
          <Link
            href={`/${locale}/salon/${salonId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Voir mon site"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#53745D]/30 px-3 py-1.5 text-xs font-semibold text-[#3a5a47] transition-colors hover:bg-[#F0F4F1]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Voir mon site</span>
          </Link>
        )}

        <LocaleSwitch />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full p-0.5 pr-1 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#53745D]/40 sm:pr-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || ""} alt={fullName} />
                <AvatarFallback className="bg-[#53745D] text-xs font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-[10rem] truncate text-sm font-semibold text-slate-900">
                  {user?.firstName ?? "Compte"}
                </span>
                {role && ROLE_LABELS[role] && (
                  <span className="block text-[11px] text-slate-500">
                    {ROLE_LABELS[role]}
                  </span>
                )}
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-60">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-semibold">
                {fullName || "Compte"}
              </p>
              {user?.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/account" className="cursor-pointer gap-2">
                <UserRound className="h-4 w-4" />
                Mon compte
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <LogoutButton className="mt-0 w-full justify-start gap-2 px-2 py-1.5 text-sm text-red-600" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
