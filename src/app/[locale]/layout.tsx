import { AdminHeader } from "@/components/admin-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";

import { usesAdminShellRole } from "@/utils/authRedirects";
import LayoutWrapper from "./LayoutWrapper";

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: any = await getServerSession(authOptions);
  const useAdminShell = usesAdminShellRole(session?.user?.role);

  return (
    <div className="flex flex-col py-2 bg-[#FEFCF9] min-h-screen">
      {useAdminShell ? (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-col">
              <AdminHeader />
              <main className="px-5">{children}</main>
            </div>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <LayoutWrapper>{children}</LayoutWrapper>
      )}
    </div>
  );
}
