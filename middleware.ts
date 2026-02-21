import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function guardByRole(pathname: string) {
  if (pathname.startsWith("/child")) return "child";
  if (pathname.startsWith("/parent")) return "parent";
  return null;
}

export function middleware(req: NextRequest) {
  const requiredRole = guardByRole(req.nextUrl.pathname);
  if (!requiredRole) return NextResponse.next();

  const role = req.cookies.get("app_role")?.value;
  if (!role) {
    const url = new URL("/auth/sign-in", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (requiredRole !== role) {
    return NextResponse.redirect(new URL(role === "parent" ? "/parent/home" : "/child/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/child/:path*", "/parent/:path*"]
};
