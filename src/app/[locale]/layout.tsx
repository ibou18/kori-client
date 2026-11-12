import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import { Suspense } from "react";

import { usesAdminShellRole } from "@/utils/authRedirects";
import { AppShellGate } from "./AppShellGate";

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: any = await getServerSession(authOptions);
  const useAdminShell = usesAdminShellRole(session?.user?.role);

  return (
    <div className="flex flex-col py-2 bg-[#FEFCF9] min-h-screen">
      {/* Suspense : AppShellGate lit les paramètres d'URL (aperçu du mini-site). */}
      <Suspense fallback={null}>
        <AppShellGate useAdminShell={useAdminShell}>{children}</AppShellGate>
      </Suspense>
    </div>
  );
}
