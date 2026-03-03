import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const cookieNames = cookies().getAll().map((cookie) => cookie.name);
  console.info("[auth/me] cookies", cookieNames);

  const authClient = createRouteHandlerClient({ cookies });
  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ hasUser: false });
  }

  return NextResponse.json({ hasUser: true, userId: user.id });
}
