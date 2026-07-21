import { NextResponse } from "next/server";
import type { NextProxy } from "next/server";

const publicRoutes = ["/login", "/api/auth/login", "/api/auth/refresh", "/api/health"];

export function proxy(request: Parameters<NextProxy>[0]) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|imagens/).*)"],
};
