"use client";

import LogoutButton from "@/app/components/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CLIENT } from "@/shared/constantes";
import logo from "@/assets/logo-black.png";
import { Calendar, LayoutDashboard, LifeBuoy, LogIn, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

type SalonPublicNavbarProps = {
  locale: string;
  pathname: string;
};

export function SalonPublicNavbar({ locale, pathname }: SalonPublicNavbarProps) {
  const { data: session, status } = useSession();
  const user = session?.user as
    | { role?: string; firstName?: string; email?: string | null }
    | undefined;
  const isClient = user?.role === CLIENT;
  const isAuthenticated = status === "authenticated";
  const signInHref = `/${locale}/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-[#53745D]/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link
            href={`/${locale}`}
            className="flex shrink-0 items-center"
            aria-label="Korí — accueil"
          >
            <Image
              src={logo}
              alt="Korí"
              className="h-9 w-auto"
              width={1000}
              height={1000}
            />
          </Link>

          <nav
            className="hidden md:flex flex-1 items-center justify-end gap-6"
            aria-label="Navigation salon"
          >
            <Link
              href={`/${locale}/support`}
              className="text-sm font-medium text-slate-600 hover:text-[#53745D] transition-colors inline-flex items-center gap-1.5"
            >
              <LifeBuoy className="size-4" aria-hidden />
              Support
            </Link>
            {isAuthenticated && isClient && (
              <Link
                href={`/${locale}/mes-rendez-vous`}
                className="text-sm font-semibold text-[#53745D] hover:text-[#3a5a47] transition-colors inline-flex items-center gap-1.5"
              >
                <Calendar className="size-4" aria-hidden />
                Mes rendez-vous
              </Link>
            )}
            {isAuthenticated && !isClient && (
              <Link
                href={`/${locale}/admin/dashboard`}
                className="text-sm font-medium text-slate-600 hover:text-[#53745D] transition-colors inline-flex items-center gap-1.5"
              >
                <LayoutDashboard className="size-4" aria-hidden />
                Mon espace
              </Link>
            )}
            {!isAuthenticated && (
              <Button
                asChild
                size="sm"
                className="bg-[#53745D] hover:bg-[#4A6854] text-white"
              >
                <Link href={signInHref} className="inline-flex items-center gap-2">
                  <LogIn className="size-4" />
                  Se connecter
                </Link>
              </Button>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <span className="text-sm text-slate-600 max-w-[10rem] truncate">
                  {user?.firstName || user?.email}
                </span>
                <LogoutButton>
                  <span className="text-sm">Déconnexion</span>
                </LogoutButton>
              </div>
            )}
          </nav>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  <SheetClose asChild>
                    <Link
                      href={`/${locale}/support`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-[#F0F4F1]"
                    >
                      <LifeBuoy className="size-4" />
                      Support
                    </Link>
                  </SheetClose>
                  {isAuthenticated && isClient && (
                    <SheetClose asChild>
                      <Link
                        href={`/${locale}/mes-rendez-vous`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-[#53745D] hover:bg-[#F0F4F1]"
                      >
                        <Calendar className="size-4" />
                        Mes rendez-vous
                      </Link>
                    </SheetClose>
                  )}
                  {isAuthenticated && !isClient && (
                    <SheetClose asChild>
                      <Link
                        href={`/${locale}/admin/dashboard`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-[#F0F4F1]"
                      >
                        <LayoutDashboard className="size-4" />
                        Mon espace
                      </Link>
                    </SheetClose>
                  )}
                </div>
                <div className="mt-auto pt-6 border-t space-y-3">
                  {!isAuthenticated ? (
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="w-full bg-[#53745D] hover:bg-[#4A6854]"
                      >
                        <Link href={signInHref}>Se connecter</Link>
                      </Button>
                    </SheetClose>
                  ) : (
                    <LogoutButton>
                      <span className="text-sm">Déconnexion</span>
                    </LogoutButton>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
