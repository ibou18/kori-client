import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";

import WelcomeComponent from "../components/WelcomeComponent";
import Navbar from "./Navbar";
import LayoutWrapper from "./LayoutWrapper";

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: any = await getServerSession(authOptions);

  return (
    <div className="flex flex-col py-2 bg-[#FEFCF9] min-h-screen">
      {session?.user?.role === "ADMIN" ? (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-col">
              <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <div className="flex justify-between items-center w-full ">
                    <WelcomeComponent />
                    <Separator orientation="vertical" className="mx-10 h-4" />
                  </div>
                  {/* <BreadcrumbList>
                          <BreadcrumbItem className="hidden md:block z-10">
                            <BreadcrumbLink href="#">
                              Building Your Application
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator className="hidden md:block" />
                          <BreadcrumbItem>
                            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                          </BreadcrumbItem>
                        </BreadcrumbList> */}
                </div>
              </header>
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
