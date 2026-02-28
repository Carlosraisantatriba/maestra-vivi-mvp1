"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

type Item = { href: Route; label: string };

export function TopNav({ items }: { items: Item[] }) {
  const pathname = usePathname();

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
              href={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
