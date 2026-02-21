import { cookies, headers } from "next/headers";

export type AppRole = "parent" | "child";

export function getRoleFromRequest(): AppRole {
  const headerRole = headers().get("x-app-role");
  if (headerRole === "parent" || headerRole === "child") return headerRole;

  const cookieRole = cookies().get("app_role")?.value;
  return cookieRole === "child" ? "child" : "parent";
}

export function getProfileIdFromRequest(): string {
  const headerId = headers().get("x-profile-id");
  if (headerId) return headerId;
  return getRoleFromRequest() === "parent" ? "demo-parent" : "demo-child";
}
