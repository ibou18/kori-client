"use client";

import { AdminHeader } from "@/components/admin-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import LayoutWrapper from "./LayoutWrapper";

/** Pages thémées du mini-site (salon, produit, commande, réservation web). */
const SALON_SITE_PATH = /^\/(fr|en)\/(salon\/[^/]+|service\/[^/]+\/[^/]+\/reservation)(\/|$)/;

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
  const isSalonSitePage = SALON_SITE_PATH.test(pathname);

  if (isSitePreview) {
    // Mêmes marges que SalonPublicLayout : la page les annule pour être pleine largeur.
    // `w-full` est indispensable : ce <main> est un enfant direct du conteneur flex-col
    // de [locale]/layout.tsx, et un item flex avec `mx-auto` se rétrécit à la largeur
    // de son contenu (la page changeait de largeur selon l'onglet affiché).
    return (
      <main className="mx-auto w-full px-4 lg:px-8">
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
            {isSalonSitePage ? (
              // Pages du mini-site vues par un pro connecté (« Voir mon site ») : elles
              // annulent les marges de SalonPublicLayout (-mx-4 -mt-4 -mb-12 lg:-mx-8) pour
              // être pleine largeur. Sans ces marges ici, elles débordaient de 48 px dans
              // SidebarInset, qui est en `overflow-auto` : un second conteneur défilant
              // captait la molette / le geste, d'où un défilement qui « bloque ».
              <main className="px-4 pb-12 lg:px-8">
                <div className="mt-4">{children}</div>
              </main>
            ) : (
              <main className="px-5">{children}</main>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return <LayoutWrapper>{children}</LayoutWrapper>;
}
