"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { supabaseBrowser } from "@/lib/supabase/client";

type Item = { href: string; label: string };

export function TopNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabaseBrowser.auth.signOut();
    document.cookie = "app_role=; path=/; max-age=0; samesite=lax";
    window.location.assign("/");
    router.refresh();
  };

  return (
    <nav className="card" style={{ marginBottom: 16 }}>
      <div className="row">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              className={`btn ${active ? "btn-primary" : "btn-secondary"}`}
              style={{ textAlign: "center" }}
              href={item.href as Route}
            >
              {item.label}
            </Link>
          );
        })}
        <button className="btn btn-secondary" style={{ textAlign: "center" }} onClick={handleSignOut}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
