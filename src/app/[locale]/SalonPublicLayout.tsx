"use client";

import { ADMIN, EMPLOYEE, OWNER } from "@/shared/constantes";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import { SalonPublicNavbar } from "./SalonPublicNavbar";

const PRO_SALON_NAV_ROLES = new Set<string>([ADMIN, OWNER, EMPLOYEE]);

export default function SalonPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const { data: session, status } = useSession();
  const localeMatch = pathname.match(/^\/(fr|en)(?:\/|$)/);
  const locale = localeMatch?.[1] ?? "fr";

  const role = (session?.user as { role?: string } | undefined)?.role;
  const useProNavbar =
    status === "authenticated" && role && PRO_SALON_NAV_ROLES.has(role);

  if (useProNavbar) {
    return <Navbar>{children}</Navbar>;
  }

  return (
    <div className="min-h-full">
      <SalonPublicNavbar locale={locale} pathname={pathname} />
      <main className="mx-auto px-4 sm:px-4 lg:px-8 pb-12">
        <div className="min-h-screen mt-4">{children}</div>
      </main>
    </div>
  );
}
