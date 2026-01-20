"use client";

import {
  Calendar,
  ChartBarIcon,
  DollarSign,
  LayoutDashboard,
  Store,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import * as React from "react";

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
import { LOGO_BLACK } from "@/shared/constantes";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { NavSecondary } from "./nav-secondary";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session }: any = useSession();

  const data = {
    user: {
      name: session?.user?.firstName + " " + session?.user?.lastName,
      email: session?.user?.email,
      avatar: session?.user?.image || "",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Utilisateurs",
        url: "/admin/users",
        icon: Users,
        // items: [
        //   {
        //     title: "Tous les utilisateurs",
        //     url: "/admin/users",
        //   },
        // {
        //   title: "Clients",
        //   url: "/admin/users?role=CLIENT",
        // },
        // {
        //   title: "Propriétaires",
        //   url: "/admin/users?role=OWNER",
        // },
        // ],
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
        // items: [
        //   {
        //     title: "Tous les salons",
        //     url: "/admin/salons",
        //   },
        // {
        //   title: "Salons actifs",
        //   url: "/admin/salons?status=active",
        // },
        // {
        //   title: "Salons en attente",
        //   url: "/admin/salons?status=pending",
        // },
        // ],
      },
      {
        title: "Réservations",
        url: "/admin/bookings",
        icon: Calendar,
        // items: [
        //   {
        //     title: "Toutes les réservations",
        //     url: "/admin/bookings",
        //   },
        // {
        //   title: "Aujourd'hui",
        //   url: "/admin/bookings?filter=today",
        // },
        // {
        //   title: "En attente",
        //   url: "/admin/bookings?status=PENDING",
        // },
        // ],
      },
      {
        title: "Paiements",
        url: "/admin/payments",
        icon: DollarSign,
        // items: [
        //   {
        //     title: "Tous les paiements",
        //     url: "/admin/payments",
        //   },
        //   {
        //     title: "Paiements en attente",
        //     url: "/admin/payments?status=pending",
        //   },
        // ],
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
    ],
    navSecondary: [
      // {
      //   title: "Mon Compte",
      //   url: "/admin/account",
      //   icon: BadgeCheck,
      // },
      // {
      //   title: "Confidentialité",
      //   url: "/admin/privacy-policy",
      //   icon: ShieldCheck,
      // },
      // {
      //   title: "Réglages",
      //   url: "/admin/settings",
      //   icon: Settings2Icon,
      // },
    ],
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
                  <span className="truncate text-xs">Administration</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainSimple items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      {/* <div className="flex-end mx-auto text-xs font-thin text-gray-500 px-4 py-2">
        ✨Version 1.0
      </div> */}
      <div className="flex justify-center p-1">
        <LanguageToggle />
      </div>
      <SidebarFooter className="mb-5">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
