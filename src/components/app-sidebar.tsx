"use client";

import * as React from "react";
import {
  BadgeCheck,
  Box,
  BoxIcon,
  Crown,
  FilePlus2,
  Handshake,
  HelpCircle,
  Landmark,
  MapPinned,
  MessageCircle,
  Plane,
  ReceiptEuroIcon,
  Scan,
  Settings2Icon,
  ShieldCheck,
  Sigma,
  Stars,
  User,
  Users2,
  Wallet,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";

// import { NavSecondary } from "@/components/nav-secondary";
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
import Link from "next/link";
import LanguageToggle from "@/app/components/LanguageToggle";
import { useSession } from "next-auth/react";
import { NavSecondary } from "./nav-secondary";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session }: any = useSession();

  const data = {
    user: {
      name: session?.user?.firstName + " " + session?.user?.lastName,
      email: session?.user?.email,
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Utilisateurs",
        url: "/admin/users",
        icon: User,
        isActive: true,
      },
      // {
      //   title: "Factures",
      //   url: "/admin/invoices",
      //   icon: FilePlus2,
      //   items: [
      //     {
      //       title: "+Facture",
      //       url: "/admin/invoices/create",
      //     },
      //   ],
      // },
      {
        title: "Livraisons",
        url: "/admin/deliveries",
        icon: ReceiptEuroIcon,
        items: [
          {
            title: "+Livraison",
            url: "/admin/deliveries/create",
          },
        ],
      },
      {
        title: "Chats",
        url: "/admin/conversations",
        icon: MessageCircle,
        items: [
          {
            title: "+Livraison",
            url: "/admin/deliveries/create",
          },
        ],
      },
      {
        title: "Voyages",
        url: "/admin/trips",
        icon: Plane,
        items: [
          {
            title: "+Livraison",
            url: "/admin/deliveries/create",
          },
        ],
      },
      // {
      //   title: "Scanner",
      //   url: "/admin/scan-receipt",
      //   icon: Scan,
      //   items: [
      //     {
      //       title: "+Reçu",
      //       url: "/admin/invoices/create",
      //     },
      //   ],
      // },
      // {
      //   title: "Clients",
      //   url: "/admin/clients",
      //   icon: Users2,
      // },
      // {
      //   title: "Suivi Km",
      //   url: "/admin/tracking",
      //   icon: MapPinned,
      //   items: [
      //     {
      //       title: "Stats",
      //       url: "/admin/tracking/stats",
      //     },
      //   ],
      // },

      // {
      //   title: "SMS",
      //   url: "/admin/sms",
      //   icon: SmilePlus,
      // },
      // {
      //   title: "Settings",
      //   url: "/admin/settings",
      //   icon: Settings2,
      // },
    ],
    navAdmin: [
      {
        title: "Entreprises",
        url: "/admin/companies",
        icon: Sigma,
        isActive: true,
      },
      {
        title: "Réglages",
        url: "/admin/settings",
        icon: Settings2Icon,
      },
    ],
    navSecondary: [
      {
        title: "Mon Compte",
        url: "/admin/account",
        icon: BadgeCheck,
      },
      {
        title: "Aide",
        url: "/admin/support",
        icon: HelpCircle,
      },
      {
        title: "Conditions",
        url: "/admin/cgv",
        icon: Handshake,
      },
      {
        title: "Privacy",
        url: "/admin/privacy-policy",
        icon: ShieldCheck,
      },

      {
        title: "Réglages",
        url: "/admin/settings",
        icon: Settings2Icon,
      },
    ],
  };
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <BoxIcon className="size-5 text-orange-500" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-lg">Hopop</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <div className="flex-end mx-auto text-xs font-thin text-gray-500">
        ✨Version de test Beta
      </div>
      <div className="flex justify-center p-1">
        <LanguageToggle />
      </div>
      {/* <NavAdmin user={data.user} navAdmin={data.navAdmin} /> */}
      <SidebarFooter className="mb-5">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
