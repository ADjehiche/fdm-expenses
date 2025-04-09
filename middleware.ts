import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define which paths are protected (require authentication)
  const isProtectedPath =
    path.startsWith("/dashboard") || path.startsWith("/api/claims");

  // Define which paths are auth paths (login/register)
  const isAuthPath = path === "/login" || path === "/register";

  const token = request.cookies.get("user_id")?.value;

  // Redirect unauthenticated users to login
  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/claims/:path*", "/login", "/register"],
};
