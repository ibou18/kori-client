"use client";

import { ADMIN, TRAVELER, USER } from "@/shared/constantes";
import { normalizePathname } from "@/utils/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Shadcn UI Components
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Lucide Icons
import {
  BoxIcon,
  BuildingIcon,
  CreditCard,
  FileTextIcon,
  HelpCircle,
  HomeIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  LogInIcon,
  MenuIcon,
  MessageSquareIcon,
  PackageIcon,
  PlaneIcon,
  PlusIcon,
  ReceiptIcon,
  Settings,
  User,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";

// Logo import
import logo from "@/assets/logo-black.png";
import LanguageToggle from "../components/LanguageToggle";
import LogoutButton from "../components/LogoutButton";

// Routes avec icônes de Lucide
export const navigation = [
  {
    name: "Accueil",
    href: "/",
    current: true,
    icon: <HomeIcon className="size-4 mr-2" />,
  },
  {
    name: "Support",
    href: "/support",
    current: false,
    icon: <LifeBuoyIcon className="size-4 mr-2" />,
  },
  {
    name: "Conditions",
    href: "/terms/privacy-policy",
    current: false,
    icon: <FileTextIcon className="size-4 mr-2" />,
  },
];

// Modification de la structure userNavigation avec des sous-menus
export const userNavigation = [
  // {
  //   name: "Accueil",
  //   href: "/",
  //   current: true,
  //   icon: <HomeIcon className="size-4 mr-2" />,
  // },
  {
    name: "Tableau de bord",
    href: "/admin/dashboard",
    current: false,
    icon: <LayoutDashboardIcon className="size-4 mr-2" />,
  },
  {
    name: "Mes Colis",
    href: "/admin/colis",
    current: false,
    icon: <BoxIcon className="size-4 mr-2" />,
  },
  {
    name: "Livraisons",
    href: "/admin/deliveries",
    current: false,
    icon: <PackageIcon className="size-4 mr-2" />,
    submenu: [
      {
        name: "Mes livraisons",
        href: "/admin/deliveries/my-deliveries",
        icon: <PackageIcon className="size-4 mr-2" />,
      },
      {
        name: "Créer une Livraison",
        href: "/admin/deliveries/available",
        icon: <PlusIcon className="size-4 mr-2" />,
      },
    ],
  },
  {
    name: "Voyages",
    href: "/admin/trips",
    current: false,
    icon: <PlaneIcon className="size-4 mr-2" />,
    submenu: [
      {
        name: "Mes voyages",
        href: "/admin/trips/my-trips",
        icon: <PlaneIcon className="size-4 mr-2" />,
      },
      {
        name: "Voyages disponibles",
        href: "/admin/trips/available",
        icon: <PlaneIcon className="size-4 mr-2" />,
      },
    ],
  },
  {
    name: "Conversations",
    href: "/admin/conversations",
    current: false,
    icon: <MessageSquareIcon className="size-4 mr-2" />,
  },
];

export const adminNavigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    current: false,
    icon: <LayoutDashboardIcon className="size-4 mr-2" />,
  },
  {
    name: "Utilisateurs",
    href: "/users",
    current: false,
    icon: <UsersIcon className="size-4 mr-2" />,
  },
  {
    name: "Clients",
    href: "/client",
    current: false,
    icon: <BuildingIcon className="size-4 mr-2" />,
  },
  {
    name: "Factures",
    href: "/invoices",
    current: false,
    icon: <ReceiptIcon className="size-4 mr-2" />,
  },
  {
    name: "Services",
    href: "/services",
    current: false,
    icon: <WrenchIcon className="size-4 mr-2" />,
  },
];

export default function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session }: any = useSession();
  const [currentNavigation, setCurrentNavigation] = useState(navigation);

  useEffect(() => {
    if (session && session.user.role === ADMIN) {
      setCurrentNavigation(adminNavigation);
    } else if (!session) {
      setCurrentNavigation(navigation);
    } else if (
      (session && session.user.role === USER) ||
      session.user.role === TRAVELER
    ) {
      setCurrentNavigation(userNavigation);
    }
  }, [pathname, session]);

  const isActive = (href: string) => normalizePathname(pathname) === href;

  return (
    <div className="min-h-full">
      {!pathname.includes("/contact/") && (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <div className="shrink-0">
                  <Link
                    href={session ? "/admin/dashboard" : "/"}
                    className="flex items-center"
                  >
                    <Image
                      src={logo}
                      alt="Kori"
                      className="h-10 w-auto"
                      width={1000}
                      height={1000}
                    />
                  </Link>
                </div>

                {/* Navigation Desktop */}
                <div className="hidden md:block ml-10">
                  <NavigationMenu>
                    <NavigationMenuList>
                      {currentNavigation.map((item: any) => (
                        <NavigationMenuItem key={item.name}>
                          {item.submenu ? (
                            <NavigationMenu>
                              <NavigationMenuList>
                                <NavigationMenuItem>
                                  <NavigationMenuTrigger
                                    className={
                                      isActive(item.href)
                                        ? "bg-muted text-primary font-medium"
                                        : ""
                                    }
                                  >
                                    <div className="flex items-center">
                                      {item.icon}
                                      {item.name}
                                    </div>
                                  </NavigationMenuTrigger>
                                  <NavigationMenuContent>
                                    <ul className="grid gap-3 p-4 w-[200px]">
                                      <li>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            href={item.href}
                                            className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                              isActive(item.href)
                                                ? "bg-muted"
                                                : ""
                                            }`}
                                          >
                                            <div className="flex items-center text-sm font-medium">
                                              {item.icon}
                                              Tous
                                            </div>
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                      {item.submenu.map((subItem: any) => (
                                        <li key={subItem.name}>
                                          <NavigationMenuLink asChild>
                                            <Link
                                              href={subItem.href}
                                              className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                                isActive(subItem.href)
                                                  ? "bg-muted"
                                                  : ""
                                              }`}
                                            >
                                              <div className="flex items-center text-sm font-medium">
                                                {subItem.icon}
                                                {subItem.name}
                                              </div>
                                            </Link>
                                          </NavigationMenuLink>
                                        </li>
                                      ))}
                                    </ul>
                                  </NavigationMenuContent>
                                </NavigationMenuItem>
                              </NavigationMenuList>
                            </NavigationMenu>
                          ) : (
                            <NavigationMenuLink
                              asChild
                              className={navigationMenuTriggerStyle({
                                className: isActive(item.href)
                                  ? "bg-muted text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground",
                              })}
                            >
                              <Link href={item.href}>
                                <div className="flex items-center">
                                  {item.icon}
                                  {item.name}
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          )}
                        </NavigationMenuItem>
                      ))}
                    </NavigationMenuList>
                  </NavigationMenu>
                </div>
              </div>

              {/* Right side actions (Desktop) */}
              <div className="hidden md:flex items-center gap-4">
                <Link href="/auth/signin" className="flex items-center gap-2">
                  <LogInIcon className="size-4" />
                  <span>Se connecter</span>
                </Link>
                <LanguageToggle />

                {/* {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session.user.image || ""}
                            alt={session.user.firstName || "User"}
                          />
                          <AvatarFallback className="bg-teal-600 text-white">
                            {session.user.firstName?.[0] ||
                              session.user.email?.[0] ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Menu utilisateur</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session.user.firstName} {session.user.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/account"
                          className="flex items-center"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Mon profil</span>
                        </Link>
                      </DropdownMenuItem>
                      {session.user.role === "TRAVELER" && (
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/earnings"
                            className="flex items-center"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Mes gains</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/settings"
                          className="flex items-center"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Paramètres</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/support" className="flex items-center">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          <span>Aide</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <LogoutButton>
                          <span>Se déconnecter</span>
                        </LogoutButton>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="default" size="sm">
                    <Link
                      href="/auth/signin"
                      className="flex items-center gap-2"
                    >
                      <LogInIcon className="size-4" />
                      <span>Se connecter</span>
                    </Link>
                  </Button>
                )} */}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MenuIcon className="size-6" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="flex flex-col p-0">
                    <SheetHeader className="px-4 py-2 border-b">
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>

                    {/* Zone défilante principale - occupe tout l'espace disponible */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="flex flex-col gap-0.5 p-2">
                        {currentNavigation.map((item: any) => (
                          <div key={item.name} className="mb-0.5">
                            {item.submenu ? (
                              <div className="space-y-0.5">
                                <Link
                                  href={item.href}
                                  className={`flex items-center py-1 px-2 rounded-md ${
                                    isActive(item.href)
                                      ? "bg-muted font-medium"
                                      : "text-muted-foreground hover:bg-muted/50"
                                  }`}
                                >
                                  {item.icon}
                                  {item.name}
                                </Link>
                                <div className="pl-4 space-y-0 border-l ml-2 border-gray-200">
                                  {item.submenu.map((subItem: any) => (
                                    <SheetClose asChild key={subItem.name}>
                                      <Link
                                        href={subItem.href}
                                        className={`flex items-center py-1 px-2 rounded-md ${
                                          isActive(subItem.href)
                                            ? "bg-muted font-medium"
                                            : "text-muted-foreground hover:bg-muted/50"
                                        }`}
                                      >
                                        {subItem.icon}
                                        {subItem.name}
                                      </Link>
                                    </SheetClose>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <SheetClose asChild>
                                <Link
                                  href={item.href}
                                  className={`flex items-center py-1 px-2 rounded-md ${
                                    isActive(item.href)
                                      ? "bg-muted font-medium"
                                      : "text-muted-foreground hover:bg-muted/50"
                                  }`}
                                >
                                  {item.icon}
                                  {item.name}
                                </Link>
                              </SheetClose>
                            )}
                          </div>
                        ))}
                      </div>

                      {session && (
                        <>
                          <Separator className="my-1" />
                          <div className="p-2 space-y-0.5">
                            <p className="text-xs font-medium mb-1 px-2 text-muted-foreground">
                              Mon compte
                            </p>
                            <SheetClose asChild>
                              <Link
                                href="/admin/account"
                                className="flex items-center py-1 px-2 rounded-md text-muted-foreground hover:bg-muted/50"
                              >
                                <User className="mr-2 h-4 w-4" />
                                <span>Mon profil</span>
                              </Link>
                            </SheetClose>

                            {session.user.role === "TRAVELER" && (
                              <SheetClose asChild>
                                <Link
                                  href="/admin/earnings"
                                  className="flex items-center py-1 px-2 rounded-md text-muted-foreground hover:bg-muted/50"
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  <span>Mes gains</span>
                                </Link>
                              </SheetClose>
                            )}

                            <SheetClose asChild>
                              <Link
                                href="/admin/settings"
                                className="flex items-center py-1 px-2 rounded-md text-muted-foreground hover:bg-muted/50"
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Paramètres</span>
                              </Link>
                            </SheetClose>

                            <SheetClose asChild>
                              <Link
                                href="/support"
                                className="flex items-center py-1 px-2 rounded-md text-muted-foreground hover:bg-muted/50"
                              >
                                <HelpCircle className="mr-2 h-4 w-4" />
                                <span>Aide</span>
                              </Link>
                            </SheetClose>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Pied de page fixe - reste visible */}
                    <div className="border-t p-2 space-y-2">
                      <LanguageToggle />
                      {session ? (
                        <LogoutButton className="w-full">
                          <div className="flex items-center gap-2">
                            <span>Déconnexion</span>
                          </div>
                        </LogoutButton>
                      ) : (
                        <Button asChild className="w-full">
                          <Link
                            href="/auth/signin"
                            className="flex items-center justify-center gap-2"
                          >
                            <LogInIcon className="size-4" />
                            <span>Se connecter</span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto px-4 sm:px-6 lg:px-8 pb-12 ">
        <div className="min-h-screen mt-4">{children}</div>
      </main>
    </div>
  );
}
