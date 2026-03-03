import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { upsertProfileForUser } from "@/lib/profile/upsert";

export async function GET(req: NextRequest) {
  const authClient = createRouteHandlerClient({ cookies });
  const code = req.nextUrl.searchParams.get("code");
  const roleParam = req.nextUrl.searchParams.get("role");
  const role = roleParam === "child" ? "child" : "parent";
  const next = role === "parent" ? "/parent/home" : "/child/home";

  if (code) {
    const { error } = await authClient.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/auth/sign-in?error=${encodeURIComponent(error.message)}`, req.url));
    }
  }

  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=session_missing", req.url));
  }

  try {
    await upsertProfileForUser(user.id, user.email ?? null, role);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(new URL(`/auth/sign-in?error=${encodeURIComponent(message)}`, req.url));
  }

  const response = NextResponse.redirect(new URL(next, req.url));
  response.cookies.set("app_role", role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    sameSite: "lax",
    httpOnly: false,
    secure: true
  });
  return response;
}
