"use client";

import {
  Calendar,
  ChartBarIcon,
  DollarSign,
  LayoutDashboard,
  Link2,
  MapIcon,
  Settings,
  Store,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { useMemo } from "react";

import LanguageToggle from "@/app/components/LanguageToggle";
import { NavMainSimple } from "@/components/nav-main-simple";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ADMIN, EMPLOYEE, LOGO_BLACK, OWNER } from "@/shared/constantes";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { NavSecondary } from "./nav-secondary";

const adminNavMain = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Utilisateurs",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Prospects",
    url: "/admin/prospect",
    icon: UserPlus,
  },
  {
    title: "Salons",
    url: "/admin/salons",
    icon: Store,
  },
  {
    title: "Réservations",
    url: "/admin/bookings",
    icon: Calendar,
  },
  {
    title: "Paiements",
    url: "/admin/payments",
    icon: DollarSign,
  },
  {
    title: "Services",
    url: "/admin/services",
    icon: Wrench,
  },
  {
    title: "Statistiques",
    url: "/admin/stats",
    icon: ChartBarIcon,
  },
  {
    title: "Configuration",
    url: "/admin/config",
    icon: Settings,
  },
  {
    title: "Cartes",
    url: "/admin/maps",
    icon: MapIcon,
  },
  {
    title: "Liens courts",
    url: "/admin/shortlinks",
    icon: Link2,
  },
];

const EMPTY_SECONDARY: { title: string; url: string; icon: LucideIcon }[] = [];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session }: any = useSession();
  const role = session?.user?.role as string | undefined;
  const salonId = session?.user?.salonId as string | undefined;

  const navMain = useMemo(() => {
    if (role === ADMIN) {
      return adminNavMain;
    }
    if (role === OWNER || role === EMPLOYEE) {
      const salonPath = salonId
        ? `/admin/salons/${salonId}`
        : "/admin/salons";
      return [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Mon salon",
          url: salonPath,
          icon: Store,
        },
        {
          title: "Réservations",
          url: "/admin/bookings",
          icon: Calendar,
        },
        {
          title: "Paiements",
          url: "/admin/payments",
          icon: DollarSign,
        },
      ];
    }
    return adminNavMain;
  }, [role, salonId]);

  const shellLabel =
    role === ADMIN ? "Administration" : "Espace professionnel";

  const data = {
    user: {
      name: session?.user?.firstName + " " + session?.user?.lastName,
      email: session?.user?.email,
      avatar: session?.user?.image || "",
    },
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#F0F4F1]">
                  <Image src={LOGO_BLACK} alt="Kori" width={32} height={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-xs">{shellLabel}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainSimple items={navMain} />
        <NavSecondary items={EMPTY_SECONDARY} className="mt-auto" />
      </SidebarContent>
      <div className="flex justify-center p-1">
        <LanguageToggle />
      </div>
      <SidebarFooter className="mb-5">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
