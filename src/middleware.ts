import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLogin = pathname === "/admin/login";
    if (!req.auth && !isLogin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (req.auth && isLogin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intlMiddleware(req as unknown as NextRequest);
});

export const config = {
  matcher: ["/((?!api|_next|uploads|.*\\..*).*)"],
};
