/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import logo from "@/assets/logo-black.png";
import { LocaleSwitch } from "@/components/locale-switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CLIENT } from "@/shared/constantes";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  FileText,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";

interface NavItem {
  name: string;
  /** Chemin sans locale ; peut porter une ancre (« /#pros »). */
  href: string;
  icon: LucideIcon;
}

const GUEST_NAV: NavItem[] = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Professionnels", href: "/#pros", icon: Sparkles },
  { name: "Support", href: "/support", icon: LifeBuoy },
  { name: "Conditions", href: "/terms/privacy-policy", icon: FileText },
];

const CLIENT_NAV: NavItem[] = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Mes rendez-vous", href: "/mes-rendez-vous", icon: Calendar },
  { name: "Support", href: "/support", icon: LifeBuoy },
  { name: "Conditions", href: "/terms/privacy-policy", icon: FileText },
];

/** Comptes pro arrivant sur une page publique : un seul raccourci vers leur espace. */
const PRO_NAV: NavItem[] = [
  { name: "Mon espace", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Support", href: "/support", icon: LifeBuoy },
];

export default function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const locale = pathname.match(/^\/(fr|en)(?:\/|$)/)?.[1] ?? "fr";
  const { data: session, status }: any = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const user = session?.user;
  const isClient = user?.role === CLIENT;
  const items = !user ? GUEST_NAV : isClient ? CLIENT_NAV : PRO_NAV;

  const path = pathname.replace(/^\/(fr|en)(?=\/|$)/, "") || "/";
  const href = (target: string) =>
    `/${locale}${target === "/" ? "" : target.replace(/^\/#/, "#")}`;
  // Une ancre n'est jamais « la page courante » : seule l'entrée sans ancre s'allume.
  const isActive = (target: string) =>
    !target.includes("#") &&
    (target === "/" ? path === "/" : path.startsWith(target));

  const signInHref = `/${locale}/auth/signin?callbackUrl=${encodeURIComponent(
    pathname || `/${locale}`,
  )}`;
  const homeHref = user && !isClient ? `/${locale}/admin/dashboard` : `/${locale}`;

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials =
    [user?.firstName, user?.lastName]
      .map((part: string | undefined) => part?.trim()?.[0] ?? "")
      .join("")
      .toUpperCase() || "K";

  return (
    <div className="min-h-full">
      {!pathname.includes("/contact/") && (
        <header
          className={cn(
            "sticky top-0 z-40 w-full border-b bg-white/85 backdrop-blur-md transition-shadow",
            scrolled
              ? "border-slate-200/80 shadow-sm"
              : "border-transparent",
          )}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
            <Link
              href={homeHref}
              className="flex shrink-0 items-center"
              aria-label="Korí — accueil"
            >
              <Image
                src={logo}
                alt="Korí"
                className="h-10 w-auto"
                width={1000}
                height={1000}
                priority
              />
            </Link>

            {/* Navigation — bureau */}
            <nav
              aria-label="Navigation principale"
              className="hidden flex-1 items-center gap-1 md:flex"
            >
              {items.map((item) => (
                <Link
                  key={item.name}
                  href={href(item.href)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-[#F0F4F1] text-[#3a5a47]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions — bureau */}
            <div className="ml-auto hidden items-center gap-3 md:flex">
              <LocaleSwitch />
              {status === "loading" ? (
                <span className="h-9 w-28 animate-pulse rounded-full bg-slate-100" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full p-0.5 pr-2 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#53745D]/40"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} alt={fullName} />
                        <AvatarFallback className="bg-[#53745D] text-xs font-semibold text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[9rem] truncate text-sm font-semibold text-slate-900">
                        {user.firstName || user.email}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="w-60">
                    <DropdownMenuLabel className="font-normal">
                      <p className="truncate text-sm font-semibold">
                        {fullName || "Compte"}
                      </p>
                      {user.email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isClient ? (
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/${locale}/mes-rendez-vous`}
                          className="cursor-pointer gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Mes rendez-vous
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/${locale}/admin/account`}
                          className="cursor-pointer gap-2"
                        >
                          <UserRound className="h-4 w-4" />
                          Mon compte
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="p-0">
                      <LogoutButton className="mt-0 w-full justify-start gap-2 px-2 py-1.5 text-sm text-red-600" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link
                    href={signInHref}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    Se connecter
                  </Link>
                  <Button
                    asChild
                    size="sm"
                    className="group h-9 rounded-full bg-[#53745D] px-4 text-white hover:bg-[#4A6854]"
                  >
                    <Link href={`/${locale}/inscription`}>
                      Créer mon salon
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Menu — mobile */}
            <div className="ml-auto md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                    <Menu className="size-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col p-0">
                  <SheetHeader className="border-b px-5 py-4 text-left">
                    <SheetTitle>
                      {user ? (
                        <span className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.image || ""} alt={fullName} />
                            <AvatarFallback className="bg-[#53745D] text-xs font-semibold text-white">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">
                              {fullName || "Compte"}
                            </span>
                            <span className="block truncate text-xs font-normal text-muted-foreground">
                              {user.email}
                            </span>
                          </span>
                        </span>
                      ) : (
                        "Menu"
                      )}
                    </SheetTitle>
                  </SheetHeader>

                  <nav
                    aria-label="Navigation principale"
                    className="flex-1 space-y-1 overflow-y-auto p-3"
                  >
                    {items.map((item) => (
                      <SheetClose asChild key={item.name}>
                        <Link
                          href={href(item.href)}
                          aria-current={isActive(item.href) ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive(item.href)
                              ? "bg-[#F0F4F1] text-[#3a5a47]"
                              : "text-slate-700 hover:bg-slate-100",
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </SheetClose>
                    ))}
                    {user && !isClient && (
                      <SheetClose asChild>
                        <Link
                          href={`/${locale}/admin/account`}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <UserRound className="h-4 w-4" />
                          Mon compte
                        </Link>
                      </SheetClose>
                    )}
                  </nav>

                  <div className="space-y-3 border-t p-4">
                    <LocaleSwitch />
                    {user ? (
                      <LogoutButton className="mt-0 w-full justify-start gap-2 px-0 py-1 text-sm font-medium text-red-600" />
                    ) : (
                      <div className="grid gap-2">
                        <SheetClose asChild>
                          <Button
                            asChild
                            className="w-full rounded-full bg-[#53745D] text-white hover:bg-[#4A6854]"
                          >
                            <Link href={`/${locale}/inscription`}>
                              Créer mon salon
                            </Link>
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full rounded-full"
                          >
                            <Link href={signInHref}>Se connecter</Link>
                          </Button>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto px-4 sm:px-4 lg:px-8 pb-12 ">
        <div className="min-h-screen mt-4">{children}</div>
      </main>
    </div>
  );
}
