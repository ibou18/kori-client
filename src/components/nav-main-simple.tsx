"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMainSimple({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const path = (usePathname() ?? "").replace(/^\/(en|fr)(?=\/|$)/, "");
  const isActive = (url: string) => path === url || path.startsWith(`${url}/`);
  // Un seul élément actif : le préfixe le plus long l'emporte
  // (« Mon salon » /admin/salons/:id plutôt que « Salons » /admin/salons).
  const activeUrl = items
    .map((item) => item.url)
    .filter(isActive)
    .sort((a, b) => b.length - a.length)[0];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <div key={item.title}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.url === activeUrl}
                className="data-[active=true]:bg-[#F0F4F1] data-[active=true]:text-[#3a5a47]"
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {item.items && item.items.length > 0 && (
              <div className="ml-6 space-y-1">
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton asChild size="sm" className="text-sm">
                      <Link href={subItem.url}>
                        <span className="ml-2">{subItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>
            )}
          </div>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

