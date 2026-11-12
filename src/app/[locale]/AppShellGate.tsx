"use client";

import { AdminHeader } from "@/components/admin-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import LayoutWrapper from "./LayoutWrapper";

/**
 * Choisit la coque de la page : back-office (sidebar + en-tête) pour les rôles
 * pro, gabarit public sinon. Exception : l'aperçu du mini-site
 * (`/salon/[id]?preview=1`, iframe de « Mon mini-site ») est rendu nu, sans
 * sidebar ni barre, pour montrer la page telle que les clients la verront.
 */
export function AppShellGate({ useAdminShell, children }: { useAdminShell: boolean; children: ReactNode }) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const isSitePreview = /^\/(fr|en)\/salon\/[^/]+\/?$/.test(pathname) && searchParams.get("preview") === "1";

  if (isSitePreview) {
    // Mêmes marges que SalonPublicLayout : la page les annule pour être pleine largeur.
    return (
      <main className="mx-auto px-4 lg:px-8">
        <div className="mt-4 min-h-screen">{children}</div>
      </main>
    );
  }

  if (useAdminShell) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col">
            <AdminHeader />
            <main className="px-5">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return <LayoutWrapper>{children}</LayoutWrapper>;
}
