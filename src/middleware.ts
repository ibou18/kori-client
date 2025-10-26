import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "fr",
  localePrefix: "always",
});

const isPublicRoute = (pathname: string) => {
  const publicRoutes = [
    "/home",
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/about",
    "/contact",
    "/pricing",
  ];
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
};

const isProtectedRoute = (pathname: string) => {
  const protectedRoutes = ["/sms", "/users"];
  return protectedRoutes.some((route) => pathname.includes(route));
};

// Liste des routes qui requièrent explicitement le rôle ADMIN
const adminOnlyRoutes = ["/admin/settings", "/admin/companies"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const response = await intlMiddleware(request);
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // On enlève le préfixe de langue
  const normalizedPathname = pathname.replace(/^\/(fr|en)/, "");

  // Gestion centralisée des routes sous "/admin"
  if (normalizedPathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/fr/auth/signin", request.url);
      url.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(url);
    }
    // Si la route est dans la liste des routes réservées aux ADMIN
    if (
      adminOnlyRoutes.some((route) => normalizedPathname.startsWith(route)) &&
      token.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/fr/admin/dashboard", request.url));
    }
  }

  // Redirection pour les pages d'authentification quand l'utilisateur est déjà connecté
  if (token && normalizedPathname.startsWith("/auth")) {
    if (
      normalizedPathname === "/auth/forgot-password" ||
      normalizedPathname.startsWith("/auth/forgot-password")
    ) {
      return response;
    }
    return NextResponse.redirect(new URL("/fr/admin/dashboard", request.url));
  }

  // Accès aux routes publiques
  if (isPublicRoute(normalizedPathname)) {
    return response;
  }

  // Protéger les routes privées standards si l'utilisateur n'est pas connecté
  if (isProtectedRoute(normalizedPathname) && !token) {
    const url = new URL("/fr/auth/signin", request.url);
    url.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/", "/(fr|en)/:path*"],
};
