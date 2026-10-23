import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const authUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: authUrl ? authUrl.startsWith("https://") : req.nextUrl.protocol === "https:",
  });

  const isLoggedIn = !!token;
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico";

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icons).*)"],
};
